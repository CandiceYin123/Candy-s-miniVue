import {extend} from "../shared"
let activeEffect;
let shouldTrack;
//抽离出一个类，面向对象的思想
class ReactiveEffect{
    private _fn:any;
    deps=[];
    active=true;//用于提升stop性能，标记是否被清空过 初始为true表示未被清空
    onStop?:()=>void//onStop可有可无
    //当实例化对象传入fn，保存fn并运行fn,
    public scheduler:Function|undefined;
    constructor(fn,scheduler?:Function){
        this._fn=fn;
        this.scheduler=scheduler;
    }
    run(){
        //会收集依赖
        if(!this.active){
            //当实例化对象执行run方法时，触发fn
            return this._fn();
        }
        shouldTrack=true;
        activeEffect=this;//保存当前的effect 获取当前实例对象

        const result=this._fn();
        //reset
        shouldTrack=false;
        return result;
    }
    stop(){
        if(this.active){//active表示当前状态
            //删除effect 这时如果频繁调用stop,就会不断清空，对性能不友好
            cleanupEffect(this);//this指的就是effect
            if(this.onStop){
                this.onStop();
            }
            this.active=false;
        }
    }
}
function cleanupEffect(effect){
    effect.deps.forEach((dep:any)=> {
        dep.delete(effect);
    });
    effect.deps.length=0;
}
const targetMap=new Map();
export function track(target,key){
    //target ->key ->dep
    if(!isTracking()) return;
    let depsMap=targetMap.get(target);
    if(!depsMap){
        depsMap=new Map();
        targetMap.set(target,depsMap);
    }
    let dep=depsMap.get(key);
    if(!dep){
        //依赖不能重复收集
        dep=new Set();
        depsMap.set(key,dep);
    }
    //如果dep中已经有activeEffect，不用添加，直接return 不需要重复的收集
    if(dep.has(activeEffect))return;
    dep.add(activeEffect);
    //反向收集deps
    activeEffect.deps.push(dep);
}
function isTracking(){
    return activeEffect!==undefined&&shouldTrack
}
//触发依赖 遍历之前收集到的所有fn 并调用它
export function trigger(target,key){
    let depsMap=targetMap.get(target);
    let dep=depsMap.get(key);
    for(const effect of dep){
        //判断是否有scheleder,如果有，则只执行scheduler方法
        if(effect.scheduler){
            effect.scheduler();
        }else{
            effect.run();
        }
    }
}


export function effect(fn,options:any={}){
    const scheduler=options.scheduler;
    //fn
    //当调用effect函数时，需要先执行一下fn，传入fn,并run
    const _effect=new ReactiveEffect(fn,scheduler);
    //options
    // _effect.onStop=options.onstop;
    // Object.assign(_effect,options);//使用assign可以替代_effect.onStop=options.onstop;
    //extend
    extend(_effect,options);
    // _effect.onStop=options.onStop;//写法与上一行效果一样
    _effect.run();
    const runner:any=_effect.run.bind(_effect);
    runner.effect=_effect;
    return runner;//return 结果 绑定this
}
export function stop(runner){
    runner.effect.stop();
}