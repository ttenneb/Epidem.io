var hashtable = /** @class */ (function () {
    function hashtable(size) {
        this.size = size;
        this.data = new Array(this.size);
    }
    hashtable.prototype.insert = function (key, value) {
        this.data[key % this.size].insert(value);
    };
    hashtable.prototype.remove = function (key) {
    };
    return hashtable;
}());
export { hashtable };
var linkedlist = /** @class */ (function () {
    function linkedlist() {
    }
    linkedlist.prototype.insert = function (data) {
        if (this.root == undefined) {
            this.root = new linkedlistNode(data);
            this.pointer = this.root.next;
        }
        else {
            this.pointer = new linkedlistNode(data);
            this.pointer = this.pointer.next;
        }
    };
    linkedlist.prototype.find = function (data) {
        var pointer = this.root;
        var i = 1;
        if (pointer.data == data) {
            this.found == this.root;
            return 0;
        }
        while (pointer.next != null) {
            if (pointer.next.data == data) {
                this.found = pointer;
                return i;
            }
            i++;
            pointer = pointer.next;
        }
        return -1;
    };
    linkedlist.prototype.remove = function (index) {
        if (index == undefined && this.found != undefined) {
            this.found.next = this.found.next.next;
        }
    };
    return linkedlist;
}());
export { linkedlist };
var linkedlistNode = /** @class */ (function () {
    function linkedlistNode(data) {
        this.data = data;
    }
    return linkedlistNode;
}());
//# sourceMappingURL=dataStructures.js.map