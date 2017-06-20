
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { MKButton } from '../material-ui';
import Avatar from './avatar';
import db from '../../api/db/realm-db';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Meteor from 'baryshok-react-native-meteor';
import SharedConstants from '../../api/constants/shared';
import Theme from '../theme';
import userHelper from '../helpers/user-helper';

const { Canvas1Color, Primary2Color, TextColor, WhiteTextColor } = Theme.Palette;
const { MKButtonMaskColor, MKButtonRippleColor } = Theme.Palette;
const { Scenes } = SharedConstants;




const SideNavigation = (props, context) => {

  let { username, email, avatarUrl } = userHelper.getUserDataForAvatar();

  let userDataView = (
    <View style={styles.userDataView}>
      <Avatar
        username={username}
        email={email}
        avatarUrl={avatarUrl}
        size={74}
      />
      <View style={styles.userNameView}>
        <Text style={styles.userNameText}>
          {userHelper.getName()}
        </Text>
      </View>
    </View>
  );



  let menuItems = [{
    iconName: 'room',
    label: 'Book a room',
    scene: Scenes.Booking,
    actionText: 'book',
  }, {
    iconName: 'person',
    label: 'Profile',
    scene: Scenes.Profile,
    availableOffline: true,
  }, {
    iconName: 'business',
    label: 'Company',
    scene: Scenes.Company,
    actionText: 'show',
    availableOffline: db.isDataSaved('company'),
  }, {
    iconName: 'message',
    label: 'Broadcasts',
    scene: Scenes.Broadcasts,
    actionText: 'show',
    hidden: !userHelper.isBroadcaster(),
  }, {
    iconName: 'lock',
    label: 'Sign up for the Access Beta',
    scene: Scenes.AccessSignUp,
    actionText: 'sign up',
    hidden: !userHelper.isNeedToSignUpForKisi(),
  }, {
    iconName: 'help',
    label: 'Help',
    scene: Scenes.MyKnotel,
    actionText: 'show',
  }, {
    iconName: 'info',
    label: 'About',
    scene: Scenes.About,
    actionText: 'show',
  }, {
    iconName: 'exit-to-app',
    label: 'Sign out',
    scene: Scenes.Login,
  }];



  let renderMenuItem = (item, index) => {
    if (item.hidden) { return null; }

    return (
      <MKButton
        key={index}
        maskColor={MKButtonMaskColor}
        rippleColor={MKButtonRippleColor}
        onPress={() => handleMenuItemPress(item)}
        style={styles.menuItemView}
      >
        <Icon
          name={item.iconName}
          size={24}
          color={'black'}
        />
        <View style={styles.menuItemLabelView}>
          <Text style={styles.menuItemLabelText}>
            {item.label}
          </Text>
        </View>
      </MKButton>
    );
  };



  let handleMenuItemPress = (item) => {
    context.closeDrawers();

    if (item.scene === Scenes.Login) {
      db.deleteCurrentUserId();
      Meteor.logout(error => {
        if (error) { console.warn('[Error][Meteor.logout]', error); }
      });
    } else if (context.isOffline() && !item.availableOffline) {
      return context.showToast(
        `Unable to ${item.actionText} while in Offline mode.` +
        '\nCheck Internet connection and try again'
      );
    }

    let props;

    if (item.scene === Scenes.MyKnotel) {
      const user = Meteor.user();
      const propertyUse = user && user.propertyUse;
      const propertyId = propertyUse && propertyUse[0] && propertyUse[0].propertyId;
      props = { propertyId };
    }

    Actions[item.scene](props);
  };



  let menuItemsView = (
    <View style={styles.menuItemsView}>
      {menuItems.map(renderMenuItem)}
    </View>
  );



  return (
    <View style={styles.wrapperView}>
      {userDataView}
      <ScrollView
        automaticallyAdjustContentInsets={false}
        bounces={false}
      >
        {menuItemsView}
      </ScrollView>
    </View>
  );

};

SideNavigation.contextTypes = {
  closeDrawers: PropTypes.func,
  showToast: PropTypes.func,
  isOffline: PropTypes.func,
};




const styles = StyleSheet.create({
  wrapperView: {
    flex: 1,
    backgroundColor: Canvas1Color,
  },
  userDataView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 30,
    paddingBottom: 12,
    paddingHorizontal: 24,
    backgroundColor: Primary2Color,
  },
  userNameView: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  userNameText: {
    fontSize: 20,
    color: WhiteTextColor,
  },
  menuItemsView: {
    flex: 1,
    paddingVertical: 16,
  },
  menuItemView: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuItemLabelView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginLeft: 14,
  },
  menuItemLabelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: TextColor,
  },
});


export default SideNavigation;
