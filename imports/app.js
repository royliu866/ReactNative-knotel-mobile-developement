
'use strict';


import React, {
  Component,
  PropTypes,
} from 'react';

import {
  Alert,
  BackHandler,
  Dimensions,
  Keyboard,
  Linking,
} from 'react-native';

import {
  Actions,
  ActionConst,
  Router,
  Scene,
} from 'react-native-router-flux';

import Meteor, { createContainer } from 'baryshok-react-native-meteor';
import AboutContainer from './ui/containers/about-container';
import AccessSignUp from './ui/components/access/signup';
import BookingCalendar from './ui/components/booking-calendar';
import BookingCardContentEditing from './ui/components/profile/booking-card-content-editing';
//import BookingContainer from './ui/containers/booking-container-new';
import BookingContainer from './ui/containers/booking-container-5';
import BookingDialog from './ui/components/booking-dialog';
import BroadcastsAddEditForm from './ui/components/broadcasts/broadcasts-add-edit-form';
import BroadcastsEditorContainer from './ui/containers/broadcasts-editor-container';
import CompanyContainer from './ui/containers/company-container';
import db from './api/db/realm-db';
import Drawer from 'react-native-drawer';
import InitialScene from './ui/components/initial-scene';
import InviteMembers from './ui/components/company/invite-members';
import Login, { Modes } from './ui/components/accounts/login';
import MyKnotelContainer from './ui/containers/my-knotel-container';
import NavigationTracker from './api/navigation-tracker';
import NotificationsNavigation from './ui/components/notifications-navigation';
import ScheduleGuest from './ui/components/profile/schedule-guest';
import SharedConstants from './api/constants/shared';
import Snackbar from './ui/components/snackbar';
import SideNavigation from './ui/components/side-navigation';
import Toast from 'baryshok-react-native-root-toast';
import UserProfileContainer from './ui/containers/user-profile-container';

const { Scenes, Subscenes, DeepLinks } = SharedConstants;

const Display = {
  LongSide: Math.max(
    Dimensions.get('window').height,
    Dimensions.get('window').width
  ),
};

const ToastOffset = -(Math.round(Display.LongSide * 0.1));




class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      menuDrawerAcceptPan: true,
    };

    this.setupRouterScenes = this.setupRouterScenes.bind(this);
    this.registerEventsListeners = this.registerEventsListeners.bind(this);
    this.unregisterEventsListeners = this.unregisterEventsListeners.bind(this);
    this.handleInitialUrl = this.handleInitialUrl.bind(this);
    this.handleUrlEvent = this.handleUrlEvent.bind(this);
    this.goToUrlBasedScene = this.goToUrlBasedScene.bind(this);
    this.goToDefaultFirstScene = this.goToDefaultFirstScene.bind(this);
    this.handleAndroidHardwareBackPress = this.handleAndroidHardwareBackPress.bind(this);
    this.openMenuDrawer = this.openMenuDrawer.bind(this);
    this.openNotificationsDrawer = this.openNotificationsDrawer.bind(this);
    this.closeDrawers = this.closeDrawers.bind(this);
    this.showSnackbar = this.showSnackbar.bind(this);
    this.hideSnackbar = this.hideSnackbar.bind(this);
    this.showToast = this.showToast.bind(this);
    this.handleLoginFailureEvent = this.handleLoginFailureEvent.bind(this);
    this.goOffline = this.goOffline.bind(this);
    this.goOnline = this.goOnline.bind(this);
    this.isOffline = this.isOffline.bind(this);
    this.isKnoteler = this.isKnoteler.bind(this);
    this.setMenuDrawerAcceptPan = this.setMenuDrawerAcceptPan.bind(this);

    this.menuDrawer = null;
    this.notificationsDrawer = null;
    this.toastShown = false;
    this.offline = false;
    this.navigationTracker = new NavigationTracker();
    this.publicationDataProcessedAgainstLocalDB = false;
    this.knoteler = undefined;
  }




  getChildContext() {
    return {
      openMenuDrawer: this.openMenuDrawer,
      openNotificationsDrawer: this.openNotificationsDrawer,
      closeDrawers: this.closeDrawers,
      showSnackbar: this.showSnackbar,
      hideSnackbar: this.hideSnackbar,
      showToast: this.showToast,
      isOffline: this.isOffline,
      isKnoteler: this.isKnoteler,
      navigationTracker: this.navigationTracker,
      setMenuDrawerAcceptPan: this.setMenuDrawerAcceptPan,
    };
  }




  componentWillMount() {
    this.setupRouterScenes();
    this.connectKnotelServer();
    this.registerEventsListeners();
    db.ddpObserver.registerEventsListeners();
  }




  componentWillUnmount() {
    db.ddpObserver.unregisterEventsListeners();
    this.unregisterEventsListeners();
    this.disconnectFromKnotelServer();
  }




  componentDidMount() {
    Linking.getInitialURL()
      .then(this.handleInitialUrl)
      .catch(error => console.log('[Error][App.getInitialURL]', error));
  }




  componentWillReceiveProps(nextProps) {
    let { userDataLoaded, user, hostCompanyDataLoaded, hostCompanySettings } = nextProps;

    if (!userDataLoaded && !user) {
      this.publicationDataProcessedAgainstLocalDB = false;
    }

    if (userDataLoaded) {
      if (!this.publicationDataProcessedAgainstLocalDB && user) {
        this.publicationDataProcessedAgainstLocalDB = db.processCurrentUserPublicationData(user);
      }
    }

    if (hostCompanyDataLoaded && hostCompanySettings) {
      this.knoteler = hostCompanySettings.hostCompanyName === 'Knotel';
    }
  }




  setupRouterScenes() {
    this.scenes = Actions.create(
      <Scene key={Scenes.Root}>
        <Scene
          key={Scenes.Initial}
          component={InitialScene}
          initial={true}
          type={ActionConst.RESET}
        />
        <Scene
          key={Scenes.Login}
          component={Login}
          type={ActionConst.RESET}
        />
        <Scene
          key={Scenes.Profile}
          component={UserProfileContainer}
          type={ActionConst.RESET}
        />
        <Scene
          key={Scenes.Company}
          component={CompanyContainer}
          type={ActionConst.RESET}
        />
        <Scene
          key={Scenes.Booking}
          component={BookingContainer}
          type={ActionConst.RESET}
        />
        <Scene
          key={Scenes.MyKnotel}
          component={MyKnotelContainer}
          type={ActionConst.RESET}
        />
        <Scene
          key={Scenes.About}
          component={AboutContainer}
          type={ActionConst.RESET}
        />
        <Scene
          key={Scenes.AccessSignUp}
          component={AccessSignUp}
          type={ActionConst.RESET}
        />
        <Scene
          key={Scenes.Broadcasts}
          component={BroadcastsEditorContainer}
          type={ActionConst.RESET}
        />
        <Scene
          key={Subscenes.BookingDialog}
          component={BookingDialog}
          direction='vertical'
          panHandlers={null}
        />
        <Scene
          key={Subscenes.InviteMembers}
          component={InviteMembers}
          direction='vertical'
          panHandlers={null}
        />
        <Scene
          key={Subscenes.BookingEditing}
          component={BookingCardContentEditing}
          direction='vertical'
          panHandlers={null}
        />
        <Scene
          key={Subscenes.BookingCalendar}
          component={BookingCalendar}
          direction='vertical'
          panHandlers={null}
        />
        <Scene
          key={Subscenes.BroadcastsAddEditForm}
          component={BroadcastsAddEditForm}
          direction='vertical'
          panHandlers={null}
        />
        <Scene
          key={Subscenes.ScheduleGuest}
          component={ScheduleGuest}
          direction='vertical'
          panHandlers={null}
        />
      </Scene>
    );
  }




  connectKnotelServer() {
    Meteor.connect('ws://knotel.com/websocket');
  }




  disconnectFromKnotelServer() {
    Meteor.disconnect();
  }




  registerEventsListeners() {
    Meteor.ddp.on('disconnected', this.goOffline);
    Meteor.getData().on('onLogin', this.goOnline);
    Meteor.getData().on('onLoginFailure', this.handleLoginFailureEvent);
    Linking.addEventListener('url', this.handleUrlEvent);
    BackHandler.addEventListener('hardwareBackPress', this.handleAndroidHardwareBackPress);
  }




  unregisterEventsListeners() {
    Meteor.ddp.off('disconnected', this.goOffline);
    Meteor.getData().off('onLogin', this.goOnline);
    Meteor.getData().off('onLoginFailure', this.handleLoginFailureEvent);
    Linking.removeEventListener('url', this.handleUrlEvent);
    BackHandler.removeEventListener('hardwareBackPress', this.handleAndroidHardwareBackPress);
  }




  handleInitialUrl(url) {
    url ? this.goToUrlBasedScene(url) : this.goToDefaultFirstScene();
  }




  handleUrlEvent(event) {
    let { url } = event;
    url && this.goToUrlBasedScene(url);
  }




  goToUrlBasedScene(url) {
    /**
     * URL examples
     * http://knotel.com/login
     * http://knotel.com/reset-password/Urqqfp3P5PrbDcPV66Pd5Eha8wl1-ws4VuIZSnjbyXI
     */

    let route = url.split('/')[3];

    switch (route) {
      case DeepLinks.Login: {
        let mode = Modes.Login;
        let currentScene = this.navigationTracker.getCurrentScene();
        if (currentScene === Scenes.Login) { Actions[Scenes.Initial](); }
        Actions[Scenes.Login]({ mode });
        break;
      }

      case DeepLinks.ResetPassword: {
        let mode = Modes.ResetPassword;
        let resetPasswordToken = url.split('/')[4];
        let currentScene = this.navigationTracker.getCurrentScene();
        if (currentScene === Scenes.Login) { Actions[Scenes.Initial](); }
        Actions[Scenes.Login]({ mode, resetPasswordToken });
        break;
      }

      default:
        console.log('[Error][App.goToUrlBasedScene] - route case default', route);
    }
  }




  goToDefaultFirstScene() {
    let localDbContainsUserData = Boolean(db.getCurrentUser());
    let firstScene = localDbContainsUserData ? Scenes.Booking : Scenes.Login;
    Actions[firstScene]();
  }




  handleAndroidHardwareBackPress() {
    if (this.navigationTracker.getRouteStackLength() > 1) { return false; }

    let currentScene = this.navigationTracker.getCurrentScene();

    switch (currentScene) {
      case Scenes.Booking:
      case Scenes.Login: {
        Alert.alert(
          'Do you really want to exit?',
          '',
          [
            { text: 'No' },
            { text: 'Yes', onPress: BackHandler.exitApp }
          ]
        );
        return true;
      }

      default: {
        let goBack = Actions[Scenes.Booking];
        if (typeof goBack === 'function') {
          goBack();
          return true;
        }
      }
    }

    return false;
  }





  openMenuDrawer() {
    Keyboard.dismiss();
    this.menuDrawer && this.menuDrawer.open();
  }




  openNotificationsDrawer() {
    Keyboard.dismiss();
    this.notificationsDrawer && this.notificationsDrawer.open();
  }




  closeDrawers() {
    this.menuDrawer && this.menuDrawer.close();
    this.notificationsDrawer && this.notificationsDrawer.close();
  }




  showSnackbar(options) {
    this.snackbar && this.snackbar.show(options);
  }




  hideSnackbar() {
    this.snackbar && this.snackbar.hide();
  }




  showToast(message) {
    if (this.toastShown) { return; }

    Toast.show(message, {
      position: ToastOffset,
      shadow: false,
      onShow: () => this.toastShown = true,
      onHidden: () => this.toastShown = false,
    });
  }




  handleLoginFailureEvent() {
    if (this.navigationTracker.getCurrentScene() !== SharedConstants.Scenes.Login) {
      Actions[SharedConstants.Scenes.Login]();
    }
  }




  goOffline() {
    this.offline = true;
  }




  goOnline() {
    this.offline = false;
  }




  isOffline() {
    return this.offline;
  }




  isKnoteler() {
    return this.knoteler;
  }




  setMenuDrawerAcceptPan(menuDrawerAcceptPan) {
    this.setState({ menuDrawerAcceptPan });
  }




  render() {
    return (
      <Drawer
        ref={ref => this.menuDrawer = ref}
        content={<SideNavigation />}
        openDrawerOffset={viewport => {
          let { width, height } = viewport;
          return width > height ? width / 2 : width / 4;
        }}
        closedDrawerOffset={0}
        type='overlay'
        acceptPan={this.state.menuDrawerAcceptPan}
        tapToClose={true}
        panOpenMask={.1}
        panCloseMask={.28}
        tweenDuration={160}
        tweenHandler={ratio => ({
          mainOverlay: { backgroundColor: `rgba(0,0,0, ${Math.min(.8, ratio)})` },
        })}
      >
        <Drawer
          ref={ref => this.notificationsDrawer = ref}
          content={<NotificationsNavigation />}
          openDrawerOffset={viewport => {
            let { width, height } = viewport;
            return width > height ? width / 4 : width / 6;
          }}
          closedDrawerOffset={0}
          type='overlay'
          side='right'
          acceptPan={false}
          tapToClose={true}
          tweenDuration={160}
          tweenHandler={ratio => ({
            mainOverlay: { backgroundColor: `rgba(0,0,0, ${Math.min(.8, ratio)})` },
          })}
        >
          <Router
            hideNavBar={true}
            hideTabBar={true}
            scenes={this.scenes}
          />
        </Drawer>
        <Snackbar ref={ref => this.snackbar = ref} />
      </Drawer>
    );
  }
}

App.propTypes = {
  userDataLoaded: PropTypes.bool,
  user: PropTypes.object,
  hostCompanyDataLoaded: PropTypes.bool,
  hostCompanySettings: PropTypes.object,
};

App.childContextTypes = {
  openMenuDrawer: PropTypes.func,
  openNotificationsDrawer: PropTypes.func,
  closeDrawers: PropTypes.func,
  showSnackbar: PropTypes.func,
  hideSnackbar: PropTypes.func,
  showToast: PropTypes.func,
  isOffline: PropTypes.func,
  isKnoteler: PropTypes.func,
  navigationTracker: PropTypes.object,
  setMenuDrawerAcceptPan: PropTypes.func,
};




export default createContainer(() => {
  if (!Meteor.userId()) {
    return {
      userDataLoaded: false,
      user: null,
      hostCompanyDataLoaded: false,
      hostCompanySettings: null,
    };
  }

  const subscriptionHandle1 = Meteor.subscribe('currentUser');
  const subscriptionHandle2 = Meteor.subscribe('ReadOwnHostCompanySettingsByCompanyMembership');

  return {
    userDataLoaded: subscriptionHandle1.ready(),
    user: Meteor.user(),
    hostCompanyDataLoaded: subscriptionHandle2.ready(),
    hostCompanySettings: Meteor.collection('host-companies-settings').findOne(),
  };
}, App);
