
'use strict';


import db from '../../api/db/realm-db';
import Meteor from 'baryshok-react-native-meteor';




const userHelper = {

  isCompanyAdmin(companyId) {
    const user = Meteor.user();
    return Boolean(
      companyId &&
      user &&
      user.companies &&
      user.companies.length &&
      user.companies.some(item => item.companyId === companyId && item.role === 'admin')
    );
  },


  isBroadcaster() {
    const user = Meteor.user();
    return Boolean(
      user &&
      user.roles &&
      user.roles.length &&
      user.roles.indexOf('broadcaster') > -1
    );
  },


  getName(user) {
    if (user === undefined) {
      user = Meteor.user() || db.getCurrentUser();
    }
    if (!user) { return ''; }

    const { profile, username, emails } = user;

    if (profile && profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }

    if (username) { return username; }

    const email = emails && emails[0] && emails[0].address;
    if (email) { return email.substr(0, email.indexOf('@')); }

    return '';
  },


  getUserDataForAvatar(user) {
    if (user === undefined) {
      user = Meteor.user() || db.getCurrentUser();
    }
    if (!user) { return {}; }

    const username = user.username;
    const emails = user.emails;
    const email = emails && emails[0] && emails[0].address;
    const profile = user.profile;
    const avatarUrl = profile && profile.avatar && profile.avatar.upload;

    return { username, email, avatarUrl };
  },


  isNeedToSignUpForKisi() {
    const user = Meteor.user();
    return (
      user &&
      user.kisi &&
      user.kisi.needToSignUp &&
      !user.kisi.signedUp
    );
  },

};


export default userHelper;
