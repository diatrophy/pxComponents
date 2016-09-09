// implementation of circular array
//
// partially inspired by - http://stackoverflow.com/questions/1583123/circular-buffer-in-javascript
//
// Jason Coelho

function CircularArray(array) {
    
    this._array= array
}  

try {

    CircularArray.prototype.get= function(index) {
        if (index >= 0)
            return this._array[index]
        else 
            return this._array[this._array.length + index]
    };

    CircularArray.prototype.slice= function(start,end) {

        // if the start is greater than zero, then we build the subset using the start and end
        // otherwise we need to recalculate the start and end indices to take into account the
        // length of the array
        var list = []
        if (start <= 0) {
            if (end < 0) {
                list = this._array.slice(this._array.length + start, this._array.length + end)
            } else {
                list = this._array.slice(this._array.length + start, this._array.length)
                list = list.concat(this._array.slice(0, end))
            }
        } else if (end >= this._array.length) {
            end = end - this._array.length
            list = this._array.slice(start,this._array.length)
            list = list.concat(this._array.slice(0, end - this._array.length))
        } else 
            list =  this._array.slice(start,end)

        return list
    };

    CircularArray.prototype.map= function(func) {
        this._array.map(func)
    };

    CircularArray.prototype.getLength = function() {
        return this._array.length
    }

    CircularArray.prototype.getTranslatedVal = function(index) {
        console.log('-------- ' + index)
        if (index > this._array.length)
            return index - this._array.length
        else if (index < 0)
            return this._array.length + index
        else
            return index
    }

} catch (err) {
    console.log(err.stack)
}

module.exports = CircularArray