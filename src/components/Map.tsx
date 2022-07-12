import { useCallback, useEffect, useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'

import maplibregl, { LngLatLike, PointLike, Map as MapType, GeoJSONSource } from 'maplibre-gl'
import { useRequest } from 'ahooks'
import makeStyles from '@mui/styles/makeStyles'
import axios from 'axios'
import Search from './Search'
import Box from '@mui/material/Box'
import Entity from './Entity'
import useEvmWallet from '../adaptors/evm-wallet-adaptor/useEvmWallet'
import Dashboard from './Dashboard'
import EditEntity from './EditEntity'
import {
    getDistanceTraversed,
    getStaticPosition,
    getTransit,
    getTransitSteps,
} from '../contract-clients/shizoContract.client'
import { haversineDistance } from '../utils'
import useEvmProvider from '../adaptors/evm-provider-adaptor/hooks/useEvmProvider'
import polyline from '@mapbox/polyline'
import { directionApi } from '../utils/request'
import { getSpawneds } from '../gql'
import { EntityType } from '../enums'
import Chest from './Chest'
import { Rarity } from '../constants'

const useStyle = makeStyles({
    panel: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: 400,
        zIndex: 3,
    },
})

type Viewport = {
    center: LngLatLike
    zoom: number
    pitch: number
    bearing: number
}

maplibregl.setRTLTextPlugin(
    'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
    err => {
        console.error(err)
    },
    true,
)

async function getEntity(id: string | number): Promise<any> {
    const { data } = await axios.get(`https://map.metagate.land/features/${id}`)
    console.log(data)
    return {
        id,
        name: data.name,
        osmName: data.osm_name,
        description: data.description,
        numberOfViews: data.view,
        embeddedLink: data.embedded_link,
        externalLink: data.link_to_vr,
        lat: (data.left_top.lat + data.right_bottom.lat) / 2,
        lon: (data.left_top.lon + data.right_bottom.lon) / 2,
        leftTop: data.left_top,
        rightBottom: data.right_bottom,
        isBuilding: data.is_building,
        type: data.isBuilding ? EntityType.Building : EntityType.Road,
        color: data.color,
    }
}

function getDynamicPositionV2(distance: number, coords: any[]): Position {
    if (coords.length === 1) {
        return {
            lat: coords[0].lat,
            lon: coords[0].lon,
        }
    }

    let sumDist = 0
    for (let j = 1; j < coords.length; j++) {
        const lastEdgeDistance = coords[j - 1].distance

        if (distance > lastEdgeDistance + sumDist) {
            sumDist += lastEdgeDistance
            continue
        }

        const traversed = distance - sumDist
        const portion = traversed / lastEdgeDistance
        return {
            lat: coords[j - 1].lat + (coords[j].lat - coords[j - 1].lat) * portion,
            lon: coords[j - 1].lon + (coords[j].lon - coords[j - 1].lon) * portion,
        }
    }

    return {
        lat: coords[coords.length - 1].lat,
        lon: coords[coords.length - 1].lon,
    }
}

function getDynamicPosition(distance: number, steps: TransitStep[], pline: string): Position {
    const coords = polyline.decode(pline, 6)
    let currentDistance = 0
    for (let i = 1; i < steps.length; i++) {
        if (distance > steps[i].distance + currentDistance) {
            currentDistance += steps[i].distance
            continue
        }

        const amountOfLastStepTraversed = distance - currentDistance
        const startingIndex = coords
            .map(([lat, lon]) => [Math.floor(lat * 10 ** 6), Math.floor(lon * 10 ** 6)])
            .findIndex(([lat, lon]) => lat == steps[i - 1].lat && lon == steps[i - 1].lon)

        if (startingIndex === -1) {
            console.log('>>>>> Starting index is -1')
            console.log(steps[i - 1].lat, steps[i - 1].lon)

            return {
                lat: steps[i - 1].lat / 10 ** 6,
                lon: steps[i - 1].lon / 10 ** 6,
            }
        }
        const lastStepCoords = coords.splice(startingIndex)
        if (lastStepCoords.length === 1) {
            return {
                lat: lastStepCoords[0][0],
                lon: lastStepCoords[0][1],
            }
        }

        let sumDist = 0
        for (let j = 1; j < lastStepCoords.length; j++) {
            const lastEdgeDistance = haversineDistance(
                [lastStepCoords[j][1], lastStepCoords[j][0]],
                [lastStepCoords[j - 1][1], lastStepCoords[j - 1][0]],
            )

            if (amountOfLastStepTraversed > lastEdgeDistance + sumDist) {
                sumDist += lastEdgeDistance
                continue
            }

            const traversed = amountOfLastStepTraversed - sumDist
            const portion = traversed / lastEdgeDistance
            console.log(`Portion: ${portion}`)
            return {
                lat: lastStepCoords[j - 1][0] + (lastStepCoords[j][0] - lastStepCoords[j - 1][0]) * portion,
                lon: lastStepCoords[j - 1][1] + (lastStepCoords[j][1] - lastStepCoords[j - 1][1]) * portion,
            }
        }
    }
}

export const Map = () => {
    const classes = useStyle()
    const params = useParams()
    const history = useHistory()
    const { defaultProvider: provider, currentChain } = useEvmProvider()
    const { activeWalletAddress, isWalletConnectedToSite } = useEvmWallet()
    const [name, setName] = useState<string>('')
    const [rarity, setRarity] = useState<number>(Rarity.Common)
    const [editingLand, setEditingLand] = useState<any>(null)
    const [mergeId, setMergeId] = useState('')
    const [showChestDialog, setShowChestDialog] = useState<boolean>(false)
    const [selectedChest, setSelectedChest] = useState<Chest | null>(null)
    const [playerPosition, setPlayerPosition] = useState<Position | null>(null)
    const [playerDistanceFromChest, setPlayerDistanceFromChest] = useState<number | null>(null)
    const [entity, setEntity] = useState<any>(null)
    const [version, setVersion] = useState(0)
    const [checkInitialColorized, setCheckInitialColorized] = useState(false)
    const [mapRef, setMapRef] = useState<MapType | null>(null)
    const [viewport, setViewport] = useState<Viewport>({
        // center: [-79.464537, 43.722474], // toronto
        // center: [-122.009118, 37.331485], // california
        center: { lng: -122.456754, lat: 37.754234 },
        zoom: 14,
        pitch: 0,
        bearing: 0,
    })

    const { data: chests } = useRequest<any, [void]>(() => getSpawneds(), {
        pollingInterval: 2000,
        onSuccess: chests => {
            const source = mapRef.getSource('chests') as GeoJSONSource
            if (!source) {
                console.error('chests source is not defined')
                return
            }
            const features = (chests ?? []).map(c => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [c.lon, c.lat],
                },
                properties: {
                    chest: 'chest',
                    lat: c.lat,
                    lon: c.lon,
                    tokenId: c.tokenId,
                },
            }))
            const data = {
                type: 'FeatureCollection',
                features,
            }
            source.setData(data)
        },
        onError: e => {
            console.error("Couldn't spawn chests")
            console.error(e)
        },
    })

    const { runAsync: getActiveTransit } = useRequest<Transit, [void]>(
        () => getTransit(activeWalletAddress, currentChain, provider),
        { manual: true },
    )

    const { runAsync: getUserStaticPosition } = useRequest<void, [void]>(
        () => getStaticPosition(activeWalletAddress, currentChain, provider),
        {
            manual: true,
        },
    )

    const { runAsync: getSteps } = useRequest<TransitStep[], [void]>(
        () => getTransitSteps(activeWalletAddress, currentChain, provider),
        {
            manual: true,
        },
    )

    const { runAsync: getDistance } = useRequest<[number, number], [void]>(
        () => getDistanceTraversed(activeWalletAddress, currentChain, provider),
        {
            manual: true,
        },
    )

    const { runAsync: cancelTransit } = useRequest<void, [void]>(() => cancelTransit())

    const getPosition = async () => {
        let pos = null
        const transit = await getActiveTransit()
        if (!transit || transit.departureTime == 0) {
            pos = await getUserStaticPosition()
            console.log(`static pos: ${JSON.stringify(pos)}`)
        } else {
            const steps = await getSteps()
            console.log(steps)
            const [distance, _] = await getDistance()
            console.log(`distance: ${distance}`)

            let path = null
            try {
                const { data } = await directionApi.get('/ride', {
                    params: {
                        walletAddress: activeWalletAddress,
                    },
                })
                path = data?.path
            } catch (e) {
                console.error(e)
                console.error('ride not found!')
            }

            if (!path) {
                pos = await getUserStaticPosition()
            } else {
                // pos = getDynamicPosition(distance, steps, polylinePath)
                pos = getDynamicPositionV2(distance, path)

                console.log(`dynamic pos: ${JSON.stringify(pos)}`)
            }
        }

        if (!pos) {
            console.log('pos is undefined')
            return
        }
        const source = mapRef.getSource('avatar') as GeoJSONSource
        if (!source) {
            console.error('map source is undefined')
            return
        }
        mapRef.setLayoutProperty('avatars', 'visibility', 'visible')
        const data = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [pos.lon, pos.lat],
                    },
                    properties: {
                        avatar: 'cat',
                    },
                },
            ],
        }
        source.setData(data)
        return pos
    }

    const { data: position } = useRequest<any, [void]>(() => getPosition(), {
        pollingInterval: 1000,
        onSuccess: pos => {
            setPlayerPosition(pos)
        },
    })

    const { signMessage, signer } = useEvmWallet()

    const colorize = useCallback(
        async mergeId => {
            while (!mapRef?.isStyleLoaded()) {
                await wait(30)
            }

            mapRef.setFilter('road_highlight', ['in', 'merge_id', mergeId])
            mapRef.setFilter('building_highlight', ['in', 'merge_id', mergeId])
            mapRef.setFilter('building_highlight_3d', ['in', 'merge_id', mergeId])
            mapRef.setFilter('leisure_park_highlight', ['in', 'merge_id', mergeId])
            mapRef.setFilter('landcover_highlight', ['in', 'merge_id', mergeId])
        },
        [mapRef],
    )

    const handleOnEditEntity = async fields => {
        if (!entity.id) {
            return
        }
        const signedMessage = await signMessage(entity.id)
        await axios.put(`https://map.metagate.land/features/${entity.id}`, {
            name: fields.name?.length > 0 ? fields.name : entity.name,
            description: fields.description?.length > 0 ? fields.description : entity.description,
            color: fields.color,
            embedded_link: fields.embeddedLink,
            link_to_vr: fields.externalLink,
            signature: signedMessage,
        })

        await fetchEntity(entity.id, false, null, null, true)
        setEditingLand(null)
        setVersion(version + 1)
    }

    useEffect(() => {
        const map = new maplibregl.Map({
            container: 'map',
            // style: 'https://shizo.space/static/configs/shizo-style.json',
            style: 'https://map.metagate.land/static/configs/shizo-play-style.json',
            // style: 'http://localhost:8080/shizo-play-style.json',
            // maxBounds: [
            //   [-122.731657, 37.544461], // Southwest coordinates
            //   [-122.104556, 37.889077], // Northeast coordinates
            // ],
            minZoom: 12,
            ...viewport,
        })
        map.getCanvas().style.cursor = 'default'
        setMapRef(map)
    }, [version])

    useEffect(() => {
        if (selectedChest) {
            console.log(
                `distance: ${haversineDistance(
                    {
                        lat: selectedChest.lat,
                        lon: selectedChest.lon,
                    },
                    playerPosition,
                )}`,
            )
            setPlayerDistanceFromChest(
                haversineDistance(
                    {
                        lat: selectedChest.lat,
                        lon: selectedChest.lon,
                    },
                    playerPosition,
                ),
            )
        }
    }, [playerPosition])

    useEffect(() => {
        const map = mapRef
        if (!map) {
            return
        }

        map.on('zoomend', () => {
            setViewport({
                center: map.getCenter(),
                zoom: map.getZoom(),
                bearing: map.getBearing(),
                pitch: map.getPitch(),
            })
        })

        map.on('dragend', () => {
            setViewport({
                center: map.getCenter(),
                zoom: map.getZoom(),
                bearing: map.getBearing(),
                pitch: map.getPitch(),
            })
        })

        map.on('pitchend', () => {
            setViewport({
                center: map.getCenter(),
                zoom: map.getZoom(),
                bearing: map.getBearing(),
                pitch: map.getPitch(),
            })
        })

        map.on('load', () => {
            map.loadImage('https://shizo.space/static/icons/Chest.png', (error, image) => {
                if (error) throw error

                map.addImage('chest', image)
                map.addSource('chests', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: [
                            // {
                            //   type: 'Feature',
                            //   geometry: {
                            //     type: 'Point',
                            //     coordinates: [0, 0],
                            //   },
                            //   properties: {
                            //     chest: 'chest',
                            //   },
                            // },
                        ],
                    },
                })

                map.addLayer({
                    id: 'chests',
                    type: 'symbol',
                    source: 'chests',
                    layout: {
                        'icon-image': ['get', 'chest'], // reference the image
                        'icon-size': ['interpolate', ['linear'], ['zoom'], 10, 0.3, 18, 0.75],
                        'icon-allow-overlap': true,
                    },
                })
            })

            map.loadImage('https://shizo.space/static/icons/Avatar3.png', (error, image) => {
                if (error) throw error

                map.addImage('cat', image)
                map.addSource('avatar', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: [
                            {
                                type: 'Feature',
                                geometry: {
                                    type: 'Point',
                                    coordinates: [0, 0],
                                },
                                properties: {
                                    avatar: 'cat',
                                },
                            },
                        ],
                    },
                })

                map.addLayer({
                    id: 'avatars',
                    type: 'symbol',
                    source: 'avatar',
                    layout: {
                        visibility: 'none',
                        'icon-image': ['get', 'avatar'], // reference the image
                        'icon-size': 0.5,
                    },
                })
            })

            map.addSource('route', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: [],
                    },
                },
            })

            map.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round',
                },
                paint: {
                    'line-color': '#888',
                    'line-width': 8,
                },
            })

            map.addLayer({
                id: 'road_highlight',
                type: 'line',
                source: 'openmaptiles',
                'source-layer': 'transportation',
                filter: ['in', 'mergeid', ''],
                layout: { 'line-cap': 'round', 'line-join': 'round' },
                paint: {
                    'line-color': 'rgba(12, 182, 255, 0.5)',
                    // 'line-opacity': 0.75,
                    'line-width': {
                        base: 1.2,
                        stops: [
                            [6.5, 0],
                            [8, 0.5],
                            [20, 13],
                        ],
                    },
                },
            })

            map.addLayer({
                id: 'building_highlight_3d',
                type: 'fill-extrusion',
                source: 'openmaptiles',
                'source-layer': 'building',
                filter: ['in', 'merge_id ', ''],
                paint: {
                    // 'fill-color': '#6e599f',
                    // 'fill-outline-color': '#6e599f',

                    'fill-extrusion-base': {
                        type: 'identity',
                        property: 'render_min_height',
                    },
                    'fill-extrusion-color': 'rgba(12, 182, 255, 1)',
                    'fill-extrusion-height': {
                        type: 'identity',
                        property: 'render_height',
                    },
                    'fill-extrusion-opacity': 0.75,
                },
            })

            map.addLayer({
                id: 'building_highlight',
                type: 'fill',
                source: 'openmaptiles',
                'source-layer': 'building',
                filter: ['in', 'merge_id ', ''],
                paint: {
                    'fill-color': 'rgba(12, 182, 255, 0.2)',
                    'fill-outline-color': 'rgba(12, 182, 255, 0.2)',
                    'fill-opacity': 0.2,
                },
            })

            map.addLayer({
                id: 'leisure_park_highlight',
                type: 'fill',
                source: 'openmaptiles',
                'source-layer': 'leisure',
                filter: ['in', 'merge_id ', ''],
                paint: {
                    'fill-color': 'rgba(12, 182, 255, 0.2)',
                    'fill-outline-color': 'rgba(12, 182, 255, 0.2)',
                },
            })

            map.addLayer({
                id: 'landcover_highlight',
                type: 'fill',
                source: 'openmaptiles',
                'source-layer': 'landcover',
                filter: ['in', 'merge_id ', ''],
                paint: {
                    'fill-color': 'rgba(12, 182, 255, 0.2)',
                    'fill-outline-color': 'rgba(12, 182, 255, 0.2)',
                },
            })

            map.on('click', e => {
                const { point, lngLat } = e
                const bbox: [PointLike, PointLike] = [
                    [point.x - 1, point.y - 1],
                    [point.x + 1, point.y + 1],
                ]

                const selectedFeatures = map.queryRenderedFeatures(bbox, {
                    // layers: ['road_footway', 'road_motorway'],
                    filter: ['!in', 'layer', 'road_label'],
                })

                map.setFilter('road_highlight', ['in', 'id', ''])
                map.setFilter('building_highlight_3d', ['in', 'id', ''])
                map.setFilter('building_highlight', ['in', 'id', ''])
                map.setFilter('leisure_park_highlight', ['in', 'id', ''])
                map.setFilter('landcover_highlight', ['in', 'id', ''])

                const feature = selectedFeatures[0]

                if (!feature) return
                console.log(feature)

                if (feature.layer?.id === 'chests') {
                    // setEntity({
                    //   id: feature.properties?.tokenId,
                    //   lat: feature.properties?.lat,
                    //   lon: feature.properties?.lon,
                    //   type: EntityType.Chest,
                    // })
                    setSelectedChest({
                        id: feature.properties?.tokenId,
                        lat: feature.properties?.lat,
                        lon: feature.properties?.lon,
                    })
                    setShowChestDialog(true)
                } else {
                    const mergeId = feature.properties?.merge_id

                    setName(feature.properties?.name ?? '')
                    setRarity(feature.properties['shizo:rarity'] ?? Rarity.Common)
                    setMergeId(mergeId ?? '')
                    setEditingLand(null)
                    colorize(mergeId)
                    fetchEntity(mergeId, false, lngLat, null, true)
                    history.push(`/${mergeId}`)
                }
            })

            map.on('mouseenter', 'chests', () => {
                map.getCanvas().style.cursor = 'pointer'
            })
            map.on('mouseleave', 'chests', () => {
                map.getCanvas().style.cursor = 'default'
            })
        })
    }, [mapRef])

    const focusOnLand = (entity, animate) => {
        if (animate) {
            mapRef?.flyTo({
                center: [entity.lon, entity.lat],
                zoom: entity.isBuilding ? 18 : 16,
                pitch: entity.isBuilding ? 60 : 0,
                bearing: entity.isBuilding ? 45 : 0,
            })
        } else {
            mapRef?.jumpTo({
                center: [entity.lon, entity.lat],
                zoom: entity.isBuilding ? 18 : 16,
                pitch: entity.isBuilding ? 60 : 0,
                bearing: entity.isBuilding ? 45 : 0,
            })
        }
    }

    const { loading: fetchEntityLoading, run: fetchEntity } = useRequest<
        any,
        [string | number, boolean, any, number | null, boolean]
    >(
        (mergeId, relocateMap = false, lngLat: any, time: number | null, animate: boolean) =>
            getEntity(mergeId),
        {
            manual: true,
            onSuccess: (land, params) => {
                //todo reset map viewport
                setEntity({
                    ...land,
                    rarity,
                })
                const lngLat = params[2]
                const time = params[3]
                const animate = params[4]
                if (params[1]) {
                    focusOnLand(land, animate)
                }
                // colorize(land)
            },
        },
    )

    const handleClickEdit = data => {
        setEditingLand(data)
    }

    const showRoute = pline => {
        const coords = polyline.decode(pline, 6)
        const source = mapRef.getSource('route') as GeoJSONSource
        source.setData({
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: coords.map(([lat, lon]) => [lon, lat]),
            },
        })
    }

    const handleCancelEdit = () => {
        //
    }

    const handleCloseDetail = () => {
        if (params.mergeId) {
            history.back()
        }
    }

    const handleSelectSearchResult = (data: any): void => {
        setMergeId(data.id)
        setEditingLand(null)
        colorize(data.id)
        fetchEntity(data.id, true, null, null, data.animate)
    }

    const wait = (time: number): Promise<void> => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve()
            }, time)
        })
    }

    useEffect(() => {
        if (params.mergeId) {
            setMergeId(params.mergeId)
            // colorize(params.mergeId)
            fetchEntity(params.mergeId, true, null, 2500, true)
        } else {
            setCheckInitialColorized(true)
        }
    }, [])

    useEffect(() => {
        if (checkInitialColorized || !mapRef) {
            return
        }

        if (params.mergeId) {
            setCheckInitialColorized(true)
            colorize(params.mergeId)
        }
    }, [mapRef])

    return (
        <div>
            <div
                id='map'
                className='relative w-full h-screen overflow-y-hidden overflow-x-hidden'
                key={version}
            />
            <Box className={classes.panel}>
                {params.mergeId && (
                    <>
                        {editingLand ? (
                            <EditEntity
								data={entity}
                                onCancel={() => {
                                    setEditingLand(null)
                                }}
                                onSave={handleOnEditEntity}
                            />
                        ) : (
                            <Entity
                                data={entity}
                                loading={fetchEntityLoading}
                                playerPosition={position}
                                onFocus={() => focusOnLand(entity, true)}
                                onEdit={data => handleClickEdit(data)}
                                onRoute={polyline => showRoute(polyline)}
                            />
                        )}
                    </>
                )}
                <Search onSelect={handleSelectSearchResult} viewport={viewport} />
            </Box>
            {/*<Button color="primary" sx={{ position: 'fixed', top: 0, right: 0, zIndex: 20 }} variant="contained" onClick={() => signIn()}>*/}
            {/*  {isSignedIn ? 'Done' : 'Connect'}*/}
            {/*</Button>*/}
            <Dashboard />
            {showChestDialog && (
                <Chest
                    chest={selectedChest}
                    distanceFromPlayer={playerDistanceFromChest}
                    onClose={() => {
                        setShowChestDialog(false)
                    }}
                />
            )}
        </div>
    )
}
