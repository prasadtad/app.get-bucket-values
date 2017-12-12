// cache/get-bucket-values.js

const RecipeKeys = require('./recipe-keys')
const _ = require('lodash')
const RedisProxy = require('../proxies/redis-proxy')

module.exports = class GetBucketValues
{
    constructor()
    {        
        this.redisProxyClient = new RedisProxy.Client()
        this.keys = new RecipeKeys(this.redisProxyClient.seperator)
        _.bindAll(this, 'buildKey', 'whenGetCollections', 'whenGetRegions', 'whenGetCuisines', 'whenQuit')
    }
    
    buildKey(setPrefix, flag) 
    {
        return setPrefix + this.redisProxyClient.seperator + (flag ? 'True' : 'False')
    }

    whenGetCollections()
    {
        return this.redisProxyClient.whenMembers(this.keys.Collection)     
    }

    whenGetRegions() 
    {
        return this.redisProxyClient.whenMembers(this.keys.Region)                  
    }

    whenGetCuisines()
    {
        return this.redisProxyClient.whenMembers(this.keys.Cuisine)
    }

    whenQuit()
    {
        return this.redisProxyClient.whenQuit()
    }
}