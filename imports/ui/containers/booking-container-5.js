
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import DateTimePicker from '../components/date-time-picker';
import dateHelper from '../helpers/date-helper';
import db from '../../api/db/realm-db';
import LocationPickerMenu from '../components/booking/location-picker-menu';
import Meteor, { createContainer } from 'baryshok-react-native-meteor';
import moment from '../../api/unpackaged-improvements/moment';
import NavigationBar from '../components/navigation-bar';
import optionsHelper from '../helpers/options-helper';
import RoomsContainer from './rooms-container-5';
import SharedConstants from '../../api/constants/shared';
import TabBar from '../components/booking/tab-bar';
import Theme from '../theme';

const { StatusBarColor, Canvas6Color } = Theme.Palette;
const { Scenes } = SharedConstants;

const BookingDates = {
  Today: 'Today',
  Tomorrow: 'Tomorrow',
  PickDate: 'Pick Date',
};

const Display = {
  ShortSide: Math.min(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
};




class Booking extends Component {

  constructor(props) {
    super(props);

    this.state = {
      propertyId: undefined,
      dateTime: this.getDefaultDateTime(SharedConstants.propertiesTimeZone),
      bookingDateBarSelectedIndex: 0,
      landscape: false,
    };

    this.handlePropertyChange = this.handlePropertyChange.bind(this);
    this.handleDateTimeChange = this.handleDateTimeChange.bind(this);
    this.handleTimeChange = this.handleTimeChange.bind(this);
    this.handleBookingDateBarSelect = this.handleBookingDateBarSelect.bind(this);
    this.onWrapperViewLayout = this.onWrapperViewLayout.bind(this);

    this.initialPropertySetFromServerData = false;
    this.publicationDataProcessedAgainstLocalDB = false;
    this.propertyRooms = [];
    this.propertyTimeZone = SharedConstants.propertiesTimeZone;
  }




  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(position => {
        return resolve(position);
      }, error => {
        console.log('[Error][BookingContainer.getCurrentPosition]', error);
        return resolve();
      }, {
        enableHighAccuracy: false,
        timeout: 4 * 1000,
        maximumAge: 10 * 60 * 1000,
      });
    });
  }




  getClosestPropertyId(position, properties) {
    if (!position || !properties || !properties.length) { return; }

    const { latitude, longitude } = position.coords || {};
    if (!latitude || !longitude) { return; }

    const property = optionsHelper.getClosestProperty(latitude, longitude, properties);
    const propertyId = property && property._id;
    return propertyId;
  }




  getUserCompanyPropertyId(props) {
    const { user, companies } = props;
    const companyId = user.companies && user.companies[0] && user.companies[0].companyId;
    const company = companyId && companies.find(company => company._id === companyId);
    const property = company && company.properties && company.properties[0];
    const propertyId = property && property.propertyId;
    return propertyId;
  }




  getDefaultDateTime(defaultTimeZone) {
    const now = moment().tz(defaultTimeZone).seconds(0).milliseconds(0);
    const minutes = now.minutes();
    const dateTime = now.minutes(minutes > 30 ? (minutes > 45 ? 60 : 30) : (minutes > 15 ? 30 : 0));
    return dateTime;
  }




  getPropertyRooms(propertyId, rooms) {
    if (!rooms) { return []; }

    const propertyRooms = [];
    rooms.forEach(room => {
      if (!propertyId || room.propertyId === propertyId) { propertyRooms.push(room); }
    });

    return propertyRooms;
  }




  componentWillMount() {
    this.context.navigationTracker.setCurrentScene(Scenes.Booking);
  }




  async componentWillReceiveProps(nextProps) {
    if (nextProps.dataLoaded || this.context.isOffline()) {
      if (!this.initialPropertySetFromServerData) {
        this.initialPropertySetFromServerData = true;

        // TO DO: implement storing of 'knoteler' flag in LocalDB.
        // If not 'knoteler', set location with getUserCompanyPropertyId method only.
        const position = await this.getCurrentPosition();
        const propertyId = position ?
          this.getClosestPropertyId(position, nextProps.properties) :
          this.getUserCompanyPropertyId(nextProps);

        const { rooms, properties } = nextProps;
        this.propertyRooms = this.getPropertyRooms(propertyId, rooms);
        this.propertyTimeZone = dateHelper.getPropertyTimeZone(propertyId, properties);
        this.setState({ propertyId });
      }
    }

    if (nextProps.dataLoaded && !this.publicationDataProcessedAgainstLocalDB) {
      const { rooms, properties } = nextProps;
      this.publicationDataProcessedAgainstLocalDB = db.add({ rooms, properties });
    }
  }




  handlePropertyChange(item, index) {
    const propertyId = item.id;
    const { rooms, properties } = this.props;
    this.propertyRooms = this.getPropertyRooms(propertyId, rooms);
    this.propertyTimeZone = dateHelper.getPropertyTimeZone(propertyId, properties);
    this.setState({ propertyId });
  }




  handleDateTimeChange(dateTime) {
    this.pickDateButtonLabel = dateTime.format('MMM D, YYYY');
    this.setState({ dateTime });
  }




  handleTimeChange(hour, minute) {
    const dateTime = this.state.dateTime.clone().hour(hour).minute(minute);
    this.setState({ dateTime })
  }




  handleBookingDateBarSelect(item, index) {
    if (
      index === this.state.bookingDateBarSelectedIndex &&
      index !== Object.keys(BookingDates).findIndex(key => BookingDates[key] === BookingDates.PickDate)
    ) { return; }


    const defaultTimeZone = SharedConstants.propertiesTimeZone;
    const currentDateTime = this.getDefaultDateTime(defaultTimeZone);

    let nextState = { bookingDateBarSelectedIndex: index };

    switch (item.label) {
      case BookingDates.Today:
        this.pickDateButtonLabel = '';
        nextState.dateTime = currentDateTime;
        break;

      case BookingDates.Tomorrow:
        this.pickDateButtonLabel = '';
        nextState.dateTime = currentDateTime.add(1, 'days');
        break;

      default:
        this.dateTimePicker && this.dateTimePicker.showPickerModal();
    }

    this.setState(nextState);
  }




  onWrapperViewLayout({ nativeEvent: { layout }}) {
    const landscape = layout.width > Display.ShortSide;
    if (landscape !== this.state.landscape) {
      this.setState({ landscape });
    }
  }




  render() {
    const { props, state } = this;
    const offline = this.context.isOffline();


    const statusBar = (
      <StatusBar
        hidden={state.landscape}
        barStyle='light-content'
        showHideTransition='fade'
        backgroundColor={StatusBarColor}
        translucent={true}
      />
    );


    const locationPickerOptions = props.dataLoaded ?
      optionsHelper.getPropertiesOptions(props.properties, false) : [];
    let locationPickerSelectedIndex = locationPickerOptions.findIndex(item => item.id === state.propertyId);

    const locationPickerMenu = (
      <LocationPickerMenu
        disabled={offline}
        menuItems={locationPickerOptions}
        onChange={this.handlePropertyChange}
        selectedIndex={locationPickerSelectedIndex}
      />
    );


    const navigationBar = !state.landscape ? (
      <NavigationBar
        toggle={locationPickerMenu}
      />
    ) : null;


    const pickDateButton = (
      <DateTimePicker
        ref={ref => { this.dateTimePicker = ref; }}
        initialDateTime={state.dateTime}
        mode='date'
        onDateTimeChange={this.handleDateTimeChange}
      />
    );


    const bookingDateBarItems = [
      { label: BookingDates.Today },
      { label: BookingDates.Tomorrow },
      { label: this.pickDateButtonLabel || BookingDates.PickDate }
    ];

    const bookingDateBar = !state.landscape ? (
      <TabBar
        disabled={offline}
        items={bookingDateBarItems}
        selectedIndex={state.bookingDateBarSelectedIndex}
        onSelect={this.handleBookingDateBarSelect}
      />
    ) : null;


    const roomsContainer = (
      <RoomsContainer
        roomsDataLoaded={props.dataLoaded}
        propertyTimeZone={this.propertyTimeZone}
        dateTime={state.dateTime}
        onTimeChange={this.handleTimeChange}
        roomIds={this.propertyRooms.map(room => room._id)}
        rooms={this.propertyRooms}
        user={props.user}
        companies={props.companies}
        properties={props.properties}
      />
    );


    return (
      <View
        onLayout={this.onWrapperViewLayout}
        style={styles.wrapperView}
      >
        {statusBar}
        {navigationBar}
        {bookingDateBar}
        {pickDateButton}
        {roomsContainer}
      </View>
    );
  }

}

Booking.propTypes = {
  dataLoaded: PropTypes.bool,
  user: PropTypes.object,
  rooms: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  companies: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
  properties: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]),
};

Booking.contextTypes = {
  navigationTracker: PropTypes.object,
  isOffline: PropTypes.func,
};



const styles = StyleSheet.create({
  wrapperView: {
    flex: 1,
    backgroundColor: Canvas6Color,
  },
});




export default createContainer(() => {
  const user = Meteor.user();
  if (!user) {
    return {
      dataLoaded: false,
      user: db.getCurrentUser() || {},
      rooms: db.getRooms(),
      companies: db.getCompanies(),
      properties: db.getPublishedProperties(),
    };
  }

  const subscriptionHandle = Meteor.subscribe('roomsDashboardCollections');

  return {
    dataLoaded: subscriptionHandle.ready(),
    user,
    rooms: Meteor.collection('rooms').find(),
    companies: Meteor.collection('companies').find(),
    properties: Meteor.collection('properties').find(),
  };
}, Booking);
