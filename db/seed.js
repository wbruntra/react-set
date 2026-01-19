const game_data = require('./game_info.json')
const Game = require('../models/Game')
const User = require('../models/User')

const my_user = {
  uid: '1sGkH0ebN1TF9Wk9cB3m3BoB2s72',
  email: 'bill.bruntrager@gmail.com',
  info: {
    displayName: 'William Bruntrager',
    email: 'bill.bruntrager@gmail.com',
    emailVerified: true,
    photoURL:
      'https://lh3.googleusercontent.com/a-/AAuE7mAGxqt8zyOM7CL5lSPwGhg-ufSsz_0OXBftrHWv6n8',
    isAnonymous: false,
    uid: '1sGkH0ebN1TF9Wk9cB3m3BoB2s72',
    providerData: [
      {
        uid: '100414281603699425237',
        displayName: 'William Bruntrager',
        photoURL:
          'https://lh3.googleusercontent.com/a-/AAuE7mAGxqt8zyOM7CL5lSPwGhg-ufSsz_0OXBftrHWv6n8',
        email: 'bill.bruntrager@gmail.com',
        phoneNumber: null,
        providerId: 'google.com',
      },
    ],
    nickname: 'Frederick',
  },
}

User.create(my_user).then(() => {
  game_data.forEach((game) => {
    Game.create(game)
  })
})
