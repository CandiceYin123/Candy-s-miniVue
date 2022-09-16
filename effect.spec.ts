import { effect,stop} from "../effect"
import { reactive } from "../reactive";
describe('effect',()=>{
    it('happy path',()=>{
        //创建一个响应式对象user
        //reactive函数用于收集依赖（get)
        const user = reactive({
            age:10
        })
        let nextAge;
        //effect函数用于触发依赖(set)
        //用effect函数进行包裹，当响应式对象里面的值发生更改了，effect函数会自动更新
        effect(()=>{
            nextAge = user.age + 1 ;
            console.log( nextAge );
        });
        //通过断言的方式去验证
        expect( nextAge ).toBe(11);
        //update
        user.age++;
        //当触发依赖时判断
        expect( nextAge ).toBe(12);
    });

    it("shoule return runner when call effect",()=>{
        //1.effect(fn) -> function(runner) ->fn ->return 结果
        let foo=10;
        const runner=effect(()=>{
            foo++;
            return "foo";
        });
        expect(foo).toBe(11);
        const r=runner();
        expect(foo).toBe(12);
        expect(r).toBe("foo");
    });
    it("scheduler",()=>{
        //1.通过effect的第二个参数给定的scheduler的一个函数
        //2.当effect第一次执行时还会执行effect的第一个参数（回调函数）
        //3.当响应式对象触发set 值更新时，不会执行fn，而是执行scheduler
        //4.如果说执行runner的时候，会再次执行fn(effect的第一个参数)
        let dummy;
        let run:any;
        //scheduler接收一个函数
        const scheduler=jest.fn(()=>{
            run=runner;
        });
        const obj=reactive({foo:1});
        const runner=effect(
            ()=>{
                dummy=obj.foo;
            },
            {scheduler}
        );
        //断言scheduler一开始不会被调用
        expect(scheduler).not.toHaveBeenCalled();
        //判断dummy值是否为1，如果为1，说明effect的第一个函数会执行 第二个函数不会执行
        expect(dummy).toBe(1);
        //should be called on first trigger
        //当响应式对象的值发生改变
        obj.foo++;
        //当响应式对象的值发生改变,会调用scheduler，而不会再次执行()=>{dummy=obj.foo;},
        expect(scheduler).toHaveBeenCalledTimes(1);
        //should not run yet
        //dummy值仍然为1，说明没有执行()=>{dummy=obj.foo;},
        expect(dummy).toBe(1);
        //manually run
        run();
        //should have run
        expect(dummy).toBe(2);
    });
    it("stop",()=>{
        let dummy;
        const obj=reactive({prop:1});
        const runner=effect(()=>{
            dummy=obj.prop;
        });
        obj.prop=2;
        expect(dummy).toBe(2);
        stop(runner);//调用stop
        //更新响应式的值
        // obj.prop=3;
        obj.prop++;
        expect(dummy).toBe(2);//调用stop后停止更新
        //调用runner后又会开始更新
        runner();
        expect(dummy).toBe(3);
    });

    it("onStop",()=>{
        const obj=reactive({
            foo:1
        });
        const onStop=jest.fn();
        let dummy;
        const runner=effect(
            ()=>{
                dummy=obj.foo;
            },
            {
                onStop,
            }
        );
        stop(runner);
        expect(onStop).toBeCalledTimes(1);
    })
});