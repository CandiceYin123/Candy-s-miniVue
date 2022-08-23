// const {effect,reactive}=require("@vue/reactivity");
// const {effectWatch,reactive}=require('./core/reactivity')
import { effectWatch, reactive } from "./core/reactivity/index.js";
// v2 
// let a=10;
// let b;
// function update(){
//     b=a+10;
//     console.log(b);
// }
// a=20;
// update();


//v3:如果a变化了，我想让b自动更新

//声明一个响应式对象
let a = reactive({
    value: 1
});
let b;

//effect函数一上来先执行一次，然后当响应式的值一旦发生变化，会再执行一次
effectWatch(() => {
    //函数:更新b的值
    b = a.value + 10;
    console.log(b);//收集的依赖是响应式对象发生的变化 是effect函数里的回调函数
})
//effect函数再执行两次
a.value = 30;//这时当a发生改变时，不再需要调用update()了
a.value = 50;

//在vue3里面除了使用reactivity去声明一个响应式对象，还可以使用ref,
//一般是在ref里使用一个单值，ref->number 或 string类型

//vue3

// export default {
//     //template -> render render函数是一个编译的过程
//     //在render的时候会接收到一个值context,就是setup返回出来的值
//     render(context) {
//         //构建 view(视图)：如何把setup里面的响应式数据渲染到视图上面去
//         //视图相当于上面的变量b
//         effectWatch(() => {
//             //view ->每次我都需要重新的创建
//             //优化方向：要计算出最小的更新点 vdom 其实是一个纯粹的JS对象 可以在JS上面做一些算法优化，比如diff算法
//             //reset 每次数据发生变化时，视图先变为空 再变为数据
//             // document.body.innerText=``;

//             const div = document.createElement("div");
//             div.innerText = context.state.count;
//             return div;
//             //root
//             // document.body.append(div);
//         })
//     },
//     setup() {
//         // 响应式数据(相当于上面的a)
//         const state = reactive({
//             count: 0,
//         })
//         window.state=state;
//         return { state };
//     }
// }
// App.render(App.setup())
const App={
    render(context){
        effectWatch(()=>{
            document.body.innerText='';
            const div=document.createElement("div");
            div.innerText=context.state.count;
            document.body.append(div)
        })
    },
    setup(){
        const state=reactive({
            count:0
        })
        window.state=state;
        return {state}
    }
}
App.render(App.setup());