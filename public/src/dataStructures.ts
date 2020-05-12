export class hashtable<T>{
    data: Array<linkedlist<T>>;
    size: number;
    constructor(size: number) {
        this.size =size;
        this.data = new Array<linkedlist<T>>(this.size);
    }insert(key: number, value: T){
        this.data[key%this.size].insert(value);
    }remove(key: number){

    }
}
export class linkedlist<T>{
    root: linkedlistNode<T>;
    pointer: linkedlistNode<T>;
    found: linkedlistNode<T>;
    constructor() {

    }
    insert(data: T){
        if(this.root == undefined){
            this.root = new linkedlistNode<T>(data);
            this.pointer = this.root.next;
        }else{
            this.pointer = new linkedlistNode<T>(data);
            this.pointer = this.pointer.next;
        }
    }
    find(data: T): number{
        let pointer = this.root;
        let i = 1;
        if(pointer.data == data){
            this.found == this.root;
            return 0;
        }
        while(pointer.next != null){
            if(pointer.next.data == data){
                this.found = pointer;
                return i;
            }
            i++;
            pointer = pointer.next;
        }
        return -1;
    }
    remove(index?: number){
        if(index == undefined && this.found != undefined){
            this.found.next = this.found.next.next;
        }
    }
}
class linkedlistNode<T>{
    next: linkedlistNode<T>;
    data: T;
    constructor(data: T) {
        this.data = data;
    }

}