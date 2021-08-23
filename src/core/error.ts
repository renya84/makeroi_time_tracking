export default class MakeroiServerError extends Error{
    constructor(message:string|undefined) {
        super(message);
    }
}