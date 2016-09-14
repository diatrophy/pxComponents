// General memory pool manager
//
// You can register an object type, along with a constuctor and recycler callback and max limit.
//
// Jason Coelho

function MemoryPool() {
    
    this._pool = new Map()
    this._recyclePool = new Map()
} 

try {

    // register an object with the memory pool
    // name - of the object
    // contructor - function that creates the object
    // limit - maximum number of objects that can be in the pool
    // recycleFunction - function that delete or cleans up the data
    MemoryPool.prototype.register= function(name,constructor,limit,recycleFunction) {

        // default is unlimited (-1)
        if (limit == null)
            limit = -1

        if (this._pool.has(name)) {     // ensure objects are not knocked out by another register
            console.log('Object Type already registered')
        } else {
            this._pool[name] ={
                constructor : constructor,
                recycleFunction : recycleFunction,
                pool : [],
                _recyclePool : [],
                limit : limit
            }
        }
    };

    // fetch an object of the given type from the pool
    MemoryPool.prototype.get= function(name) {

        // ensure that the pool exists before attempting to get data
        if (this._pool[name] == null) {
            console.log('----------------------- POOL NOT REGISTERED ----------------------- ' + name)
            return
        }

        // retrieve the object from the pool if there is one, otherwise use the constructor function to 
        // create one
        if (this._pool[name]._recyclePool.length > 0) {
            return this._pool[name]._recyclePool.pop()
        } else {
            if (this._pool[name].limit == -1 || this._pool[name].pool.length < this._pool[name].limit) {
                var id = name + "-" + Math.random()
                var val = this._pool[name].constructor(id)      // use the constructor obj
                this._pool[name].pool.push(val)                 // keep a ref to the created object
                return val
            } else {
                console.log('-------------------- object limit  ( ' + this._pool[name].limit + ' ) reached for - ' + name )
            }
        }
    }

    // put the object in the recycle pool
    MemoryPool.prototype.recycle= function(name,val) {
        
        if (this._pool[name].limit != -1) {                     // ignore adding to pool if unlimited

            var rF = this._pool[name].recycleFunction           // invoke the recycle function to clean up data

            if (rF != null)      
                rF(val)

            // put the recycled object in the pool (unless it is already full)
            if (this._pool[name]._recyclePool.length < this._pool[name].limit) 
                this._pool[name]._recyclePool.push(val)
        }
    }

} catch (err) {
    console.log('Error in memory pool')
    console.log(err.stack)
}

module.exports = MemoryPool