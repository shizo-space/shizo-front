import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'

import maplibregl, { LngLatLike, PointLike, Map as MapType, Popup } from 'maplibre-gl'
import { DetailSegment } from './DetailSegment'
import { useRequest, useSetState } from 'ahooks'
import makeStyles from '@mui/styles/makeStyles'
import axios from 'axios'
import Search from './Search'
import Box from '@mui/material/Box'
import Entity from './Entity'
import { Button } from '@mui/material'
import useNearWallet from '../adapters/near-wallet/useNearWallet'
import useNftContract from '../hooks/useNftContract'
import Dashboard from './Dashboard'
import EditEntity from './EditEntity'
import { youtubeParser } from '../utils'
// import MapboxInspect from 'mapbox-gl-inspect'

const useStyle = makeStyles({
  panel: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: 375,
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
    console.log(err)
  },
  true,
)

async function getEntity(id: string | number): Promise<any> {
  const { data } = await axios.get(`https://shizo.space/features/${id}/`)
  return {
    id,
    name: data.name,
    osmName: data.osm_name,
    description: data.description,
    numberOfViews: data.view,
    embeddedLink: data.embedded_link,
    externalLink: data.link_to_vr,
    lat: (data.left_top.lat + data.right_bottom.lat) / 2,
    lon: (data.left_top.long + data.right_bottom.long) / 2,
    leftTop: data.left_top,
    rightBottom: data.right_bottom,
    isBuilding: data.is_building,
    color: data.color,
  }
}

export const Map = () => {
  const classes = useStyle()
  const params = useParams()
  const history = useHistory()
  const [name, setName] = useState('')
  const [editingLand, setEditingLand] = useState<any>(null)
  const [mergeId, setMergeId] = useState('')
  const [entity, setEntity] = useState({
    id: mergeId,
    name: '',
    description: '',
    embeddedLink: '',
  })
  const [version, setVersion] = useState(0)
  const [checkInitialColorized, setCheckInitialColorized] = useState(false)
  const [popup, setPopup] = useState<Popup | null>(null)
  const [mapRef, setMapRef] = useState<MapType | null>(null)
  const [viewport, setViewport] = useState<Viewport>({
    // center: [-79.464537, 43.722474], // toronto
    // center: [-122.009118, 37.331485], // california
    center: [-122.456754, 37.754234],
    zoom: 14,
    pitch: 0,
    bearing: 0,
  })

  console.log({ params })

  const colorize = useCallback(
    async mergeId => {
      while (!mapRef?.isStyleLoaded()) {
        console.log('retry')
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
    await axios.put(`https://shizo.space/features/${entity.id}/`, {
      name: fields.name?.length > 0 ? fields.name : entity.name,
      description: fields.description?.length > 0 ? fields.description : entity.description,
      color: fields.color,
      embedded_link: fields.embeddedLink,
      link_to_vr: fields.externalLink,
    })

    await fetchEntity(entity.id, false, null, null)
    setEditingLand(null)
    setVersion(version + 1)
  }

  useEffect(() => {
    const map = new maplibregl.Map({
      container: 'map',
      style: 'https://shizo.space/static/configs/shizo-style.json',
      ...viewport,
    })
    map.getCanvas().style.cursor = 'default'

    setMapRef(map)
  }, [version])

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

        console.log(selectedFeatures)

        map.setFilter('road_highlight', ['in', 'id', ''])
        map.setFilter('building_highlight_3d', ['in', 'id', ''])
        map.setFilter('building_highlight', ['in', 'id', ''])
        map.setFilter('leisure_park_highlight', ['in', 'id', ''])
        map.setFilter('landcover_highlight', ['in', 'id', ''])

        const feature = selectedFeatures[0]
        if (!feature) return

        setName(feature.properties?.name ?? '')
        setMergeId(feature.properties?.merge_id ?? '')
        console.log('MAP REF')
        console.log(mapRef)
        setEditingLand(null)
        colorize(feature.properties?.merge_id)
        fetchEntity(feature.properties?.merge_id, false, lngLat, null)
        history.push(`/map/${feature.properties?.merge_id}`)

        console.log(feature)
        console.log(feature.properties?.name)
        console.log(name)
      })
    })
  }, [mapRef])

  useEffect(() => {
    if (!popup) {
      return
    }
    const closeButtonElem = document.getElementById('popup-close-icon')
    closeButtonElem?.addEventListener('click', () => {
      popup.remove()
    })
  }, [popup])

  const focusOnLand = entity => {
    mapRef?.flyTo({
      center: [entity.lon, entity.lat],
      zoom: entity.isBuilding ? 18 : 16,
      pitch: entity.isBuilding ? 60 : 0,
      bearing: entity.isBuilding ? 45 : 0,
    })
  }

  const {
    loading: fetchEntityLoading,
    data: land,
    run: fetchEntity,
  } = useRequest<any, [string | number, boolean, any, number | null]>(
    (mergeId, relocateMap = false, lngLat: any, time: number | null) => getEntity(mergeId),
    {
      manual: true,
      onSuccess: (res, params) => {
        //todo reset map viewport
        const lngLat = params[2]
        const time = params[3]

        if (params[1]) {
          focusOnLand(res)
        }
        // colorize(res)
        if (mapRef) {
          // TODO handle twitter
          const content = res.embeddedLink
            ? `
            <div style="width: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-end">
            <div>
              <img id="popup-close-icon" style="cursor: pointer; width:16px; height:16px;" src="/close-icon.png" alt="Close"/>

            </div>
          </div>
          
          <iframe width="360" height="218"
        src="https://youtube.com/embed/${youtubeParser(res.embeddedLink)}">
        </iframe>`
            : `
            <div style="width: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-end">
              <div>
                <img id="popup-close-icon" style="cursor: pointer; width:16px; height:16px;" src="/close-icon.png" alt="Close"/>
              </div>
            </div>
            <div style="
        width: 360px;
        height: 218px;
        
        background: rgba(20, 86, 255, 0.05);
        border-radius: 10px;">
        <div style="display: flex; justify-content: center; align-items: center; flex-direction: column; width: 100%; height: 100%;">
          <img style="width:60px; height:14px; margin-bottom:10px;" src="/shizo-embed.png" alt="SHIZO"/>
          <div style="color: rgba(20, 86, 255, 0.3); font-size: 14px;
          line-height: 21px;">
          There is no embedding
          </div>
        </div>
        </div>`
          if (popup) {
            popup.remove()
          }
          const p = new maplibregl.Popup({ closeOnClick: true, closeButton: false })
            .setLngLat(lngLat ?? [res.lon, res.lat])
            .setHTML(content)
            .addTo(mapRef)
          setPopup(p)
        }
        console.log(res)
      },
    },
  )

  useEffect(() => {
    setEntity(land)
  }, [land])

  const handleClickEdit = data => {
    console.log(data)
    setEditingLand(data)
  }

  const handleCancelEdit = () => {
    popup?.remove()
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
    fetchEntity(data.id, true, null, null)
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
      fetchEntity(params.mergeId, true, null, 2500)
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
      <div id="map" className="relative w-full h-screen overflow-y-hidden overflow-x-hidden" key={version} />
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
                onFocus={() => focusOnLand(entity)}
                onEdit={data => handleClickEdit(data)}
              />
            )}
          </>
        )}
        <Search onSelect={handleSelectSearchResult} />
      </Box>
      {/*<Button color="primary" sx={{ position: 'fixed', top: 0, right: 0, zIndex: 20 }} variant="contained" onClick={() => signIn()}>*/}
      {/*  {isSignedIn ? 'Done' : 'Connect'}*/}
      {/*</Button>*/}
      <Dashboard />
    </div>
  )
}
