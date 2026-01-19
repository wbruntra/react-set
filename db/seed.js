const game_data = require('./game_info.json')
const db = require('../db_connection')

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

const run = async () => {
  const existingUser = await db('users').where('uid', my_user.uid).first()

  if (existingUser) return

  await db('users').insert(my_user)

  for (const game of game_data) {
    await db('games').insert(game)
  }
}

run().then(() => {
  console.log('Seeding complete')
  process.exit(0)
})
