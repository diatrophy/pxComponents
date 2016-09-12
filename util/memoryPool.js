

function MemoryPool() {
    
    this._pool = new Map()
    this._recyclePool = new Map()
} 

try {

    MemoryPool.prototype.register= function(name,constructor,limit,recycleFunction) {

        // default is unlimited (-1)
        if (limit == null)
            limit = -1

        if (this._pool.has(name)) {
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

    MemoryPool.prototype.get= function(name) {

        if (this._pool[name] == null) {
            console.log('----------------------- POOL NOT REGISTERED ----------------------- ' + name)
            return
        }

        if (this._pool[name]._recyclePool.length > 0) {
            return this._pool[name]._recyclePool.pop()
        } else {
            if (this._pool[name].limit == -1 || this._pool[name].pool.length < this._pool[name].limit) {
                var id = name + "-" + Math.random()
                var val = this._pool[name].constructor(id)
                this._pool[name].pool.push(val)
                return val
            } else {
                console.log('-------------------- object limit  ( ' + this._pool[name].limit + ' ) reached for - ' + name )
            }
        }
    }

    MemoryPool.prototype.recycle= function(name,val) {
        
        if (this._pool[name].limit != -1) {
            var rF = this._pool[name].recycleFunction
            if (rF != null)      
                rF(val)
            
            this._pool[name]._recyclePool.push(val)
        }
    }

} catch (err) {
    console.log(err.stack)
}

module.exports = MemoryPool