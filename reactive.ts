import { mutableHandlers, readonlyHanderlers } from "./baseHandlers";
export const enum ReactiveFlags {//枚举
    IS_REACTIVE="__v_isReactive",
    IS_READONLY="__v_isReadonly"
}
export function reactive(raw) {
    //reactive本质是通过proxy做的代理，然后去拦截
    //接收没有处理的raw对象，
    return createActiveObject(raw, mutableHandlers)//重构
}
export function readonly(raw) {
    return createActiveObject(raw,readonlyHanderlers);
}
function createActiveObject(raw:any,baseHandlers){
    return new Proxy(raw,baseHandlers);
}

export function isReactive(value){//如果这个value值不是一个proxy，就不会去调用baseHandelers里面的get方法，所以得到undefined
    //解决方法：将undefined转换成布尔值  !!
    return !!value[ReactiveFlags.IS_REACTIVE];//采用枚举进行表示
}
export function isReadonly(value){
    return !!value[ReactiveFlags.IS_READONLY];
}