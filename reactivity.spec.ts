import {reactive,isReactive} from "../reactive";
//任务拆分思想 针对reactive做单独的单元测试
describe('reactive',()=>{
    it("happy path",()=>{
        const original={foo:1};
        const observed=reactive(original);
        expect(observed).not.toBe(original);
        expect(observed.foo).toBe(1);
        //isReactive()方法：判断一个对象是不是一个reactive对象
        expect(isReactive(observed)).toBe(true);
        expect(isReactive(original)).toBe(false);
    })
})