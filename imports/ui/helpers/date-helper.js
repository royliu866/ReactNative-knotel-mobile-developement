
'use strict';


import SharedConstants from '../../api/constants/shared';




const dateHelper = {

  getPropertyTimeZone(propertyId, properties) {
    if (!propertyId || !properties) { return SharedConstants.propertiesTimeZone; }
    let property = properties.find(property => property._id === propertyId);
    let properyTimeZone = property && property.timeZone;
    return properyTimeZone || SharedConstants.propertiesTimeZone;
  },




  getRoomPropertyTimeZone(room, properties) {
    if (!room || !properties) { return SharedConstants.propertiesTimeZone; }
    let roomProperty = properties.find(property => property._id === room.propertyId);
    let roomProperyTimeZone = roomProperty && roomProperty.timeZone;
    return roomProperyTimeZone || SharedConstants.propertiesTimeZone;
  }

};


export default dateHelper;
