if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
  }

 
  
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const stripePublicKey = process.env.STRIPE_PUBLIC_KEY
  
  console.log(stripeSecretKey, stripePublicKey)

  const express = require('express')
  const app = express()
  const fs = require('fs')
  const stripe = require('stripe')(stripeSecretKey)

  
  app.set('view engine', 'ejs')
  app.use(express.static
    ('public'))
  app.use(express.json())
  
  app.get('/store', function(req, res) {
    fs.readFile('items.json', function(error, data) {
      if (error) {
        res.status(500).end()
      } else {
        res.render('store.ejs', {
          stripePublicKey: stripePublicKey,
          items: JSON.parse(data)
        })
      }
    })
  })
  
  

  app.post('/purchase', function(req, res) {
    fs.readFile('items.json', function(error, data) {
      if (error) {
        res.status(500).end()
      } else {
        const itemsJson = JSON.parse(data)
        console.log(itemsJson);
        const itemsArray = itemsJson["Bot store"].concat(itemsJson.Merch)
        let total = 0
         console.log(itemsArray)
        req.body.items.forEach(function(item) {
          const itemJson = itemsArray.find(function(i) {
            return i.Id == item.Id
          })
          total = total + itemJson.price * item.quantity
        })

  
        stripe.charges.create({
          amount: total,
          source: req.body.stripeTokenId,
          currency: 'usd'
        }).then(function() {
          console.log('Charge Successful')
          res.json({ message: 'Successfully purchased items' })
        }).catch(function() {
          console.log('Charge Fail')
          res.status(500).end()
        })
      }
    })
  })
  
  app.listen(process.env.PORT || 3000)

  