//响应式库
//依赖
//声明一个全局变量，用于Dep类与effectWatch函数之间建立关系
let currentEffect;//闭包的应用！！！！！！！！数据共享 建立关联
//声明一个类，使用订阅发布模式
class Dep {
    constructor(val) {
        //存储不重复依赖数据集合
        //收集的依赖使用set集合存储
        this.effects = new Set();//存储收集到的依赖
        this._val = val;
    }
    //1.收集依赖
    depend() {
        //如果currentEffect有值，则收集依赖到set集合中
        if (currentEffect) {
            this.effects.add(currentEffect);
        }
    }
    //获取value值
    get value() {
        this.depend();//收集依赖
        return this._val;
    }
    //当传入的val值发生变化时
    set value(newVal) {
        this._val = newVal;
        this.notice();//set函数触发依赖，这里需注意：一定要在值更新以后再触发依赖
    }
    //2.触发依赖：执行之前订阅的一些响应式事件（数据劫持）
    notice() {
        //触发一下我们之前收集到的依赖
        this.effects.forEach((effect) => {
            effect();
        })
    }
}
export function effectWatch(effect) {
    //收集依赖
    currentEffect = effect;
    //回调函数一上来先调用一次
    effect()
    // dep.depend();//这一步可以不调用，可以将这一步写到get函数中，收集依赖
    currentEffect = null;
}
// let b;
// const dep = new Dep(10);
// effectWatch(() => {
//     b = dep.value + 10;
//     console.log(b);
// })
// //值发生变更
// dep.value = 30;
// dep.notice();

//reactivity
// 刚刚上面的实现是针对单个值，dep->number string
// reactive响应式是针对一个对象 对象有对应的key->dep 一个key对应一个dep
// 这个对象是在什么时候改变的？
// object.a->get
// object.a=2 ->set进行拦截更新
// vue2使用了defineProperty方法 它有一个属性描述符，用属性描述符的变化去随意的修改属性的值，可以设置set get方法，
// 缺点就是：1.有很多属性覆盖不到，2.属性得一个一个设置，如果需要嵌套执行时是非常消耗性能的，执行周期是在初始化(new)的时候就需要执行的，性能消耗还是非常明显的
// vue3使用了proxy(代理对象) 拦截 如果对象中有100个属性，不用执行100次，执行一次就ok了。

//声明一个全局的map,用于存储dep
const targetMap = new Map();
//这个函数将key与dep做一个映射
function getDep(target,key) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        //如果dep不存在，new一个实例，并添加到depsMap中，key与dep做一个映射
        dep = new Dep();
        depsMap.set(key, dep);
    }
    return dep;
}
//obj是一个对象
export function reactive(obj) {
    //new proxy里面的参数表示：第一个拦截的对象，第二个是如何处理
    return new Proxy(obj, {
        //Proxy的好处:无论传入的obj对象中有多少个属性，只需要设置一次proxy,所有属性的get都会被代理
        //当obj对象被访问的时候，get就会被触发
        get(target, key) {
            // console.log(key);//age
            // console.log(target);//{age:18}
            //key->dep 让key和dep做一个匹配
            //dep 我们存储在哪里
            const dep = getDep(target,key);
            //让dep对象收集依赖
            dep.depend();
            //return target[key]
            return Reflect.get(target, key);//把获取到的值return出去
        },
        set(target, key, value) {
            //首先要获取到dep
            const dep=getDep(target,key);
            //获取到更新的值
            const result=Reflect.set(target,key,value);
            //触发依赖：更新值以后再触发依赖
            dep.notice();
            return result;
        }
    });
}
// const user = reactive({
//     age: 18
// });
// let double;
// effectWatch(() => {
//     console.log("----reactivity----")
//     double=user.age;
//     console.log(double);
// });
// user.age=19;


