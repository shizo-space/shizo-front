import {
  EntityChanged as EntityChangedEvent,
  RoadLimitationChanged as RoadLimitationChangedEvent,
} from "../generated/Shizo/Shizo"
import {
  EntityChanged,
  RoadLimitationChanged,
} from "../generated/schema"


export function handleEntityChanged(event: EntityChangedEvent): void {
  let id = event.params.tokenId.toString()

  let entity = EntityChanged.load(id)
  if (entity == null) {
    entity = new EntityChanged(id)
  }

  entity.changer = event.params.changer
  entity.tokenId = event.params.tokenId
  entity.entity_t = event.params.entity.t
  entity.entity_level = event.params.entity.level
  entity.entity_rarity = event.params.entity.rarity
  entity.entity_customColor = event.params.entity.customColor
  entity.entity_customName = event.params.entity.customName
  entity.entity_pos_lat = event.params.entity.pos.lat
  entity.entity_pos_lon = event.params.entity.pos.lon
  entity.save()
}

export function handleRoadLimitationChanged(
  event: RoadLimitationChangedEvent
): void {
  let id = event.params.tokenId.toString()

  let entity = RoadLimitationChanged.load(id)

  if (entity == null) {
    entity = new RoadLimitationChanged(id)
  }

  entity.owner = event.params.owner
  entity.tokenId = event.params.tokenId
  entity.blockStatus = event.params.blockStatus
  entity.save()
}

