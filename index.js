// index.js

const _ = require('lodash')

const RedisPoco = require('redis-poco')

const whenQuit = (redisPoco, err) => redisPoco.whenQuit().then(() => Promise.reject(err))

exports.whenHandler = (event) => {
    if (!event) return Promise.reject(new Error('Invalid event - ' + JSON.stringify(event)))        
    if (!_.isObject(event)) return Promise.reject(new Error('Invalid event - ' + JSON.stringify(event)))        
    console.info(JSON.stringify(event))
    const redisPoco = new RedisPoco({ namespace: 'recipe', itemKey: 'item', endpoint: process.env.CACHE_ENDPOINT, attributes: [ 'vegan', 'totalTimeInMinutes', 'approved', 'spiceLevel', 'region', 'cuisine', 'chefId', 'ingredientIds', 'overnightPreparation', 'accompanimentIds', 'collections' ]})
    try
    {
        let p = redisPoco.whenGetAttributeValues(event.bucket);
        return p.then(results => redisPoco.whenQuit()
                    .then(() => Promise.resolve(event.forChat ? toChatGallery(event.bucket, results) : results)))
                .catch(err => whenQuit(redisPoco, err))
    }
    catch (err)
    {
        return whenQuit(redisPoco, err)
    }
}

exports.handler = (event, context, callback) => {
    exports.whenHandler(event)
            .then(result => callback(null, result))
            .catch(err => callback(err))    
}

const toChatGallery = (bucket, bucketValues) => {
    const message = {
              'attachment':{
                'type':'template',
                'payload':{
                  'template_type':'generic',
                  'elements':[]
                }
              }
            }
    for (const bucketValue of _.sampleSize(bucketValues, 10)) {
        message.attachment.payload.elements.push({
            'title':bucketValue,
            'image_url':'https://res.cloudinary.com/recipe-shelf/image/upload/v1484217570/stock-images/' + bucketValue + '.jpg',
            'item_url':'https://www.recipeshelf.com.au/' + bucket + '/' + bucketValue.toLowerCase() + '/'
        })
    }
    return { 'messages' : [ message ] }
}