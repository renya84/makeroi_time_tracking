import {MakeroiLogger} from '../types/core/core';

export default class Logger implements MakeroiLogger{
    production: boolean;
    buffer: any[];

    private BUFFER_SIZE: number;
    constructor(production:boolean) {
        this.production = production;
        this.buffer = [];
        this.BUFFER_SIZE = 100;
    }

    public log(...args:any[]):void{
        if(!this.production){
            console.debug(...args);
        }else{
            this.bufferControl(args.length);
            this.buffer.push([...args]);
        }
    }

    private bufferControl(length:number):void{
        while(this.buffer.length+length >= this.BUFFER_SIZE){
            this.buffer.shift();
            length--;
        }
    }
}