# 📘 Go 语言学习笔记（Functions, Methods, and Interfaces in Go）

---

# 目录
1. 函数 Functions  
2. 参数传递：值与指针  
3. 数组与切片作为参数  
4. 良好的函数设计原则  
5. 一等公民：函数作为值  
6. 匿名函数与闭包  
7. 可变参数 Variadic Functions  
8. defer 延迟调用  
9. 方法 Methods 与结构体  
10. 封装 Encapsulation  
11. 指针接收者 Pointer Receivers  
12. 多态 Polymorphism  
13. 接口 Interfaces  
14. 接口值：动态类型与动态值  
15. Nil 接口、Nil 动态值、Nil 动态类型  
16. 类型断言 Type Assertion  
17. 错误处理 Error Handling

---

# 1. 函数 Functions

## 1.1 为什么使用函数？Why use functions
- **可复用性 Reusability**：常用操作封装成函数，提高效率  
- **抽象 Abstraction**：隐藏细节，只暴露功能  
- **可读性 Readability**：通过函数名理解用途  
- **易维护性 Maintainability**：逻辑结构清晰、易调试  

```go
func foo(x int, y int) {
    fmt.Println(x * y)
}

func main() {
    foo(2, 3)
}
````

---

## 1.2 参数与返回值 Parameters & Return values

```go
func add(x int) int {
    return x + 1
}
```

**多返回值（Python 也有类似机制）：**

```go
func pair(x int) (int, int) {
    return x, x + 1
}

a, b := pair(3)
```

---

# 2. 参数传递：值与指针 Call by Value vs Pointer

## 2.1 Go 中所有参数默认都是**值传递 (pass by value)**

修改形参不会影响实参：

```go
func foo(x int) {
    x = x + 1
}

main() {
    a := 2
    foo(a)
}
```

## 2.2 通过指针修改外部变量 Pointer argument

```go
func inc(p *int) {
    *p = *p + 1
}

func main() {
    x := 2
    inc(&x)
}
```

指针优点：

* 可以修改外部变量
* 避免拷贝大型数据

---

# 3. 数组与切片

## 3.1 数组作为参数会被复制（不推荐）

```go
func foo(a [3]int) {
    a[0] = 100
}
```

## 3.2 数组指针可修改原数组

```go
func foo(a *[3]int) {
    (*a)[0]++
}
```

## 3.3 切片作为参数更推荐

切片包含指向底层数组的指针 → 不会复制底层数据：

```go
func foo(s []int) {
    s[0] = 100
}
```

> 💡 **实战建议：Go 里几乎总是使用 slice 而不是 array。**

---

# 4. 良好函数设计原则

* 函数名必须清晰 meaningful naming
* 函数应只做一件事 single responsibility
* 参数数量尽量少
* 结合功能层级创建函数调用树（call hierarchy）
* 函数越小越容易调试

---

# 5. 一等公民：函数作为值 First-Class Functions

函数可以：

* 动态创建
* 赋值给变量
* 存入数据结构
* 作为参数传递
* 作为返回值返回

```go
var funcVar func(int) int

func inc(x int) int { return x + 1 }

func main() {
    funcVar = inc
    fmt.Println(funcVar(3))
}
```

---

# 6. 匿名函数 Anonymous Functions

```go
v := apply(func(x int) int { return x + 1 }, 2)
```

---

# 7. 闭包 Closures

**闭包 = 函数 + 其定义时的环境（environment）**

```go
func makeAdder(x int) func(int) int {
    return func(y int) int {
        return x + y // x 被“记住”
    }
}

add10 := makeAdder(10)
add10(5) // 15
```

---

# 8. 可变参数 Variadic Functions

```go
func max(vals ...int) int {
    m := vals[0]
    for _, v := range vals {
        if v > m {
            m = v
        }
    }
    return m
}
```

将 slice 传入可变参数：

```go
s := []int{1,2,3}
max(s...)
```

---

# 9. defer 延迟调用 Deferred calls

特性：

* **立即计算参数**
* **在函数结束时执行（LIFO 顺序）**

```go
func main() {
    i := 1
    defer fmt.Println(i + 1) // 参数立即计算 → 打印 2
    i++
}
```

用途：

* 关闭文件
* 释放资源
* 解锁 mutex
* 回滚事务

---

# 10. 方法 Methods 与结构体 Structs

方法是带接收者（receiver）的函数：

```go
type MyInt int

func (m MyInt) Double() int {
    return int(m * 2)
}

v := MyInt(3)
v.Double()
```

---

# 11. 结构体方法：隐式接收者 Implicit Method Argument

```go
type Point struct {
    x, y float64
}

func (p Point) DistToOrigin() float64 {
    t := math.Pow(p.x, 2) + math.Pow(p.y, 2)
    return math.Sqrt(t)
}
```

调用：

```go
p := Point{3,4}
p.DistToOrigin()
```

---

# 12. 指针接收者 Pointer Receivers

用于修改结构体：

```go
func (p *Point) OffsetX(dx float64) {
    p.x += dx
}
```

建议：

* 所有方法都使用指针接收者 或 所有使用值接收者
* 保持一致性非常重要

---

# 13. 多态 Polymorphism

不同类型实现同一接口 → 用一个接口变量即可存放所有类型。

---

# 14. 接口 Interfaces

接口定义行为，而非数据：

```go
type Shape2D interface {
    Area() float64
    Perimeter() float64
}
```

满足接口条件的类型无需声明“implements”，只要实现方法即可。

---

# 15. 接口值：动态类型 & 动态值

接口变量包含两部分：

1. **动态类型 dynamic type**：实际的具体类型
2. **动态值 dynamic value**：其数据

例：

```go
var s Speaker
d := Dog{"Brian"}
s = d
s.Speak()
```

---

# 16. Nil 接口 vs Nil 动态值 vs Nil 动态类型

| 情况              | 描述                  | 能否调用方法 |
| --------------- | ------------------- | ------ |
| Nil 动态值（但有动态类型） | `var d *Dog; s = d` | ✔ 能调用  |
| Nil 接口（无动态类型）   | `var s Speaker`     | ❌ 不能调用 |

示例：

```go
var s Speaker // 动态类型 nil
s.Speak()     // panic
```

---

# 17. 类型断言 Type Assertion

用于从接口变量中取出具体类型：

```go
value, ok := s.(Dog)
if ok {
    fmt.Println(value)
}
```

---

# 18. 错误处理 Error Handling

Go 不使用异常机制，采用显式错误返回：

```go
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a/b, nil
}
```

调用：

```go
v, err := divide(10, 2)
if err != nil {
    fmt.Println("Error:", err)
}
```

最佳实践：

* 错误要被检查
* 错误应告诉调用者“发生了什么”与“如何修复”

---


