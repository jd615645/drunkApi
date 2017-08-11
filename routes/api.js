const express = require('express')
const router = express.Router()

const Promise = require('bluebird')
const _ = require('lodash')
const firebase = require('firebase')
const config = require('../config/config.json')
const bcrypt = require('bcrypt')
const saltRounds = 10

// init firebase
firebase.initializeApp(config)
const db = firebase.database()
const ref = db.ref('users')

/* GET data. */
router.get('/', (req, res, next) => {
  // ref
  //   .once('value')
  //   .then(snapshot => snapshot.val())
  //   .then((data) => {
  //     let sol = []
  //     _.each(data, (val) => {
  //       sol.push(val)
  //     })
  //     res.json(sol)
  //   })
})

// {
//   date: '2017/07/28',
//   avg: 10,
//   max: 15,
//   longitude: 24.120036,
//   latitude: 120.674357
// }

/* POST data */
router.post('/signup', (req, res, next) => {
  let username = req.body.username || undefined
  let email = req.body.email || undefined
  let password = req.body.password || undefined
  let photourl = req.body.photourl || ''

  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((user) => {
      let uid = user.uid
      console.log(uid)

      ref.child(uid).set({
        uid: uid,
        username: username,
        email: email,
        photourl: photourl,
        drunkData: false,
        friends: false
      })
      res.json({ 'msg': 'signout succese' })
    })
    .catch((error) => {
      // Handle Errors here.
      let errorCode = error.code
      let errorMessage = error.message
      res.json({ 'msg': errorCode + '-' + errorMessage})
    })
})
router.post('/signin', (req, res, next) => {
  let email = req.body.email || undefined
  let password = req.body.password || undefined

  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(() => {
      res.json({ 'msg': 'signin succese' })
    })
    .catch((error) => {
      // Handle Errors here.
      let errorCode = error.code
      let errorMessage = error.message
      res.json({  'msg': errorCode + ' - ' + errorMessage })
    })
})
router.post('/signout', (req, res, next) => {
  firebase
    .auth()
    .signOut()
    .then(() => {
      res.json({ 'msg': 'signout succese' })
    }).catch((error) => {
    let errorCode = error.code
    let errorMessage = error.message
    res.json({  'msg': errorCode + ' - ' + errorMessage })
  })
})
router.post('/edit/photourl', (req, res, next) => {
  let user = firebase.auth().currentUser

  if (user !== null) {
    let uid = user.uid
    console.log(uid)

    let photourl = req.body.photourl || undefined

    if (!_.isUndefined(photourl)) {
      ref.child(uid).update({'photourl': photourl})
    }

    res.json({ 'msg': 'check succese'})
  }else {
    res.json({ 'msg': 'logged out'})
  }
})
router.post('/add/friend', (req, res, next) => {
  let user = firebase.auth().currentUser

  if (user !== null) {
    let uid = user.uid
    let friendUid = req.body.friendUid || undefined

    console.log(friendUid)
    if (!_.isUndefined(friendUid)) {
      ref
        .child(uid)
        .once('value')
        .then(snapshot => snapshot.val())
        .then((selfData) => {
          let friend = selfData.friends
          console.log(friend)
          ref
            .child(friendUid)
            .once('value')
            .then(snapshot => snapshot.val())
            .then((data) => {
              if (_.isArray(friend)) {
                ref.child(uid).update({'friends': _.merge(friend, data)})
              }else {
                ref.child(uid).update({'friends': [data]})
              }
            })
        })
    }

    res.json({ 'msg': 'check succese'})
  }else {
    res.json({ 'msg': 'logged out'})
  }
})

function isValidDate (dateString) {
  let regEx = /^\d{4}-\d{2}-\d{2}$/
  return dateString.match(regEx) !== null
}

module.exports = router
