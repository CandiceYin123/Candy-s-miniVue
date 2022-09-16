import { track, trigger } from "./effect";
import { ReactiveFlags } from "./reactive";
//优化点
const get=createGetter();//这样可以提高性能，get只会调用一次即可，下次调用时使用缓存即可
const set=createSetter();
const readonlyGet=createGetter(true);
//高阶函数：返回一个函数 重构思想
function createGetter(isReadonly = false) {//默认值为false
    return function get(target, key) {
        // console.log(key);
        if(key===ReactiveFlags.IS_REACTIVE){
            //只要不是readonly就是一个reactive
            return !isReadonly;
        }else if(key===ReactiveFlags.IS_READONLY){
            return isReadonly;//正好相反
        }
        const res = Reflect.get(target, key);
        if (!isReadonly) {
            track(target, key);
        }
        return res;
    }
}

function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);//注意这里：必须是获取值以后再触发依赖
        //TODO 触发依赖
        trigger(target, key);
        return res;
    }
}
export const mutableHandlers = {
    get,
    set
}
export const readonlyHanderlers = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`key:${key} set 失败 因为 target 是 readonly`,target);
        return true;
    }
}