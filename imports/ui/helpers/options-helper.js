
'use strict';


import _ from 'underscore';




const optionsHelper = {

  getPropertiesOptions(properties, addAllLocationsOption) {
    let propertiesOptions = properties && properties.map(property => ({
      id: property._id,
      label: property.title,
    })).sort((a, b) => {
      if (a.label > b.label) return 1;
      if (a.label < b.label) return -1;
      if (a.label === b.label) return 0;
    }) || [];
    if (addAllLocationsOption) { propertiesOptions.push({ label: 'All locations' }); }
    return propertiesOptions;
  },




  getPropertiesOptionsForMyKnotel(properties) {
    const propertiesOptions = properties && properties.map(property => ({
      id: property._id,
      label: `${property.title}, ${property.addressLine}`,
    }));
    return propertiesOptions;
  },




  getPropertyFloorsOptions(propertyId, rooms, addAllFloorsOption) {
    if (!propertyId || !rooms) { return addAllFloorsOption ? [{ label: 'All floors' }] : []; }

    let propertyRooms = [];
    rooms.forEach(room => {
      if (room.propertyId === propertyId) { propertyRooms.push(room); }
    });

    if (!propertyRooms.length) { return addAllFloorsOption ? [{ label: 'All floors' }] : []; }

    let floorsOptions = _.chain(propertyRooms)
      .pluck('location')
      .pluck('floor')
      .uniq()
      .sort()
      .filter(floor => (typeof floor === 'number'))
      .map(floor => ({
        label: 'Floor ' + floor.toString(),
        floor: floor,
      }))
      .value();

    if (addAllFloorsOption) { floorsOptions.push({ label: 'All floors' }); }
    return floorsOptions;
  },




  getPropertyRoomsOptions(propertyId, rooms) {
    if (!propertyId || !rooms) { return []; }

    let propertyRooms = [];
    rooms.forEach(room => {
      if (room.propertyId === propertyId) { propertyRooms.push(room); }
    });

    if (!propertyRooms.length) { return []; }

    let roomsOptions = propertyRooms.map(room => ({
      id: room._id,
      label: room.name,
    })).sort((a, b) => {
      if (a.label > b.label) return 1;
      if (a.label < b.label) return -1;
      if (a.label === b.label) return 0;
    });

    return roomsOptions;
  },




  getPropertyFloorRoomsOptions(propertyId, floor, rooms) {
    if (!rooms) { return []; }

    let filterRoomsForPropertyAndFloor = (room) => {
      let matchesPropertyIfDefined = !propertyId || room.propertyId === propertyId;
      let matchesFloorIfDefined = (
        !floor ||
        !room.location ||
        !room.location.floor ||
        room.location.floor === floor
      );
      return matchesPropertyIfDefined && matchesFloorIfDefined;
    };

    let propertyFloorRooms = [];
    rooms.forEach(room => {
      if (filterRoomsForPropertyAndFloor(room)) { propertyFloorRooms.push(room); }
    });

    if (!propertyFloorRooms.length) { return []; }

    let roomsOptions = _.chain(propertyFloorRooms)
      .sortBy('_id')
      .sortBy('location.floor')
      .map(room => ({
        id: room._id,
        label: room.name,
      }))
      .value();

    return roomsOptions;
  },




  getUserCompaniesOptions(user, companies) {
    if (!user || !user.companies || !companies) { return []; }

    let userCompaniesIds = user.companies.map(company => company.companyId);
    let userCompanies = [];
    companies.forEach(company => {
      if (userCompaniesIds.indexOf(company._id) !== -1) { userCompanies.push(company); }
    });

    if (!userCompanies.length) { return []; }

    let companiesOptions = userCompanies.map(company => ({
      id: company._id,
      label: company.name,
    }));

    return companiesOptions;
  },




  getClosestProperty(latitude, longitude, properties) {
    // Convert Degress to Radians
    const deg2Rad = (deg) => (deg * Math.PI / 180);


    // Get Distance between two lat/lng points;
    // ref: http://rosettacode.org/wiki/Haversine_formula#JavaScript;
    const Haversine = (lat1, lng1, lat2, lng2) => {
      const R = 6372.8; // Earth's Radius in Kilometers
      const dLat = deg2Rad(lat2 - lat1);
      const dLng = deg2Rad(lng2 - lng1);
      const a = (
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2Rad(lat1)) * Math.cos(deg2Rad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2)
      );
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c;
      return d; // Distance in Kilometers
    };


    let closestPropertyIndex = 0;
    let minDistance = 99999;

    for (let i = 0; i < properties.length; i++) {
      const { lat, lng } = properties[i].coordinates || {};
      if (!lat || !lng) { continue; }

      const distance = Haversine(lat, lng, latitude, longitude);
      if (distance < minDistance) {
        closestPropertyIndex = i;
        minDistance = distance;
      }
    }

    const property = properties[closestPropertyIndex];
    return property;
  },

};


export default optionsHelper;
