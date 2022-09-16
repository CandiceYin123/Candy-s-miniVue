
import {readonly,isReadonly} from "../reactive";
describe("readonly",()=>{
    it("happy path",()=>{
        //not set 不可以被改写，是只读的，即不会触发依赖，即不会做依赖收集
        const original={foo:1,bar:{baz:2}};
        const wrapped=readonly(original);
        expect(wrapped).not.toBe(original);
        expect(isReadonly(wrapped)).toBe(true);
        expect(isReadonly(original)).toBe(false);
        expect(wrapped.foo).toBe(1);
    });
    it("warn then call set",()=>{
        //console.warn()
        //使用mock去模拟一个假的警告方法
        console.warn=jest.fn();//jest.fn()会去创建一个特殊的function，这个函数有一些特殊的属性方便后续做断言

        const user=readonly({
            age:10,
        });
        user.age=11;
        expect(console.warn).toBeCalled();
    })
})