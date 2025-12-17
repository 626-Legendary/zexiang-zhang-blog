# 📘 Why Should I Learn Go?  
# 为什么要学习 Go 语言？

---

## 1. ⚡ Go Code Runs Fast  
## Go 代码运行速度快

- Go 是**编译型语言**（compiled language）
- 编译后的程序非常接近 **机器码（machine code）**，性能接近 C/C++
- 非常适合写：
  - 高性能服务器（high-performance servers）
  - 分布式系统（distributed systems）
  - 网络服务（network services）
  - 工具类程序（CLI tools）

**Keywords（术语）**

- *machine code*：机器码，CPU 能直接执行的二进制指令  
- *compiled language*：编译型语言  
- *performance*：性能  

---

## 2. ♻ Garbage Collection（垃圾回收）

### 自动内存管理（Automatic Memory Management）

Go 自动管理内存，不需要像 C 那样手动 `malloc/free`。

### Why important? 为什么重要？

- 手动内存管理容易出错：
  - memory leak（内存泄漏）
  - dangling pointer（悬空指针）
- Go 的垃圾回收器（Garbage Collector，GC）自动决定：
  - **where** memory is allocated（内存在哪里分配）
  - **when** memory can be deallocated（内存何时释放）

**特点：**

- 传统：GC 常见于解释型语言（Python/JavaScript/Java 虚拟机）
- Go：既是 **编译语言 + 有 GC** → 兼顾：
  - 高性能（high performance）
  - 易用性（ease of use）

**Keywords**

- *garbage collection (GC)*：垃圾回收  
- *memory management*：内存管理  
- *allocation/deallocation*：分配 / 释放  

---

## 3. 🧱 Simpler Objects  
## 更简单的“对象”概念

Go 有面向对象思想，但没有 `class`，使用：

- `struct`（结构体）保存数据
- method（方法）绑定到类型上

```go
type Point struct {
    X, Y, Z float64
}

func (p Point) DistToOrigin() float64 {
    // ...
}
```

### Benefits 好处

* 没有传统 OOP 的多继承、复杂层级
* 强调 **组合（composition）** 而不是继承（inheritance）

**Keywords**

* *struct*：结构体
* *method*：方法
* *encapsulation*：封装
* *composition over inheritance*：组合优于继承

---

## 4. 🧵 Concurrency Is Efficient（并发高效）

Go 最大亮点之一：**原生并发支持**。

### 4.1 并行 & 并发（Parallelism vs Concurrency）

| 名词              | 中文 | 解释说明                      |
| --------------- | -- | ------------------------- |
| **parallelism** | 并行 | 物理上同时执行多个任务（需要多核 CPU）     |
| **concurrency** | 并发 | 在同一时间段管理多个任务，快速切换，不要求真正同时 |

**类比：**

* 并行：多个人一起做饭
* 并发：一个人快速切换切菜/炒菜/洗碗

### 4.2 Go 的并发模型

* **goroutine**：轻量级线程（lightweight threads）
* **channel**：在 goroutine 之间传递数据（communication）
* **select**：多路复用，监听多个 channel

**特点：**

* 写法简单（easy to write）
* 内存开销小，数量可以很多
* 非常适合 I/O 密集、网络服务、后端服务

**Keywords**

* *goroutine*：Go 协程
* *channel*：通道
* *synchronization*：同步
* *race condition*：竞争条件

---

## 5. 🗂 Go Workspace（工作空间）

推荐目录结构（经典 GOPATH 模式，了解概念即可）：

```text
workspace/
    src/   # 源代码 source
    pkg/   # 编译后的中间包 compiled packages
    bin/   # 可执行文件 executables
```

| 目录     | 含义       |
| ------ | -------- |
| `src/` | Go 源码    |
| `pkg/` | 归档包文件    |
| `bin/` | 编译后可执行文件 |

> 📌 新版 Go 使用 `go mod` 后不再强制使用此结构，但概念仍然有用。

---

## 6. 📦 Packages（包）

每个 `.go` 文件都必须声明所属包：

```go
package main

import "fmt"

func main() {
    fmt.Println("hello world")
}
```

* `package main`：可独立运行的程序（会生成可执行文件）
* `func main()`：程序入口函数（entry point）

**常见标准库包（standard library）**

* `fmt`：格式化 I/O
* `math`：数学函数
* `time`：时间与日期
* `strings`：字符串操作
* `net/http`：HTTP 服务器和客户端
* `os`：操作系统接口

---

## 7. 🔧 Go Toolchain（go 命令）

| 命令         | 作用（中文）    |
| ---------- | --------- |
| `go build` | 编译程序      |
| `go run`   | 编译 + 立即运行 |
| `go fmt`   | 自动格式化代码   |
| `go test`  | 运行测试      |
| `go get`   | 下载/安装第三方包 |
| `go doc`   | 查看文档      |
| `go list`  | 列出包信息     |

---

## 8. 📝 Naming & Variables（命名与变量）

### 8.1 命名规则（Naming Rules）

* 必须以字母或下划线开头
* 区分大小写（case sensitive）
* 同一作用域内不能重复声明同名变量

### 8.2 变量声明（长格式）

```go
var x int
var x, y int
var s string
```

### 8.3 短变量声明（短格式）

只能在函数内使用：

```go
x := 100       // 自动推断类型（type inference）
name := "Go"
flag := true
```

**Keywords**

* *zero value*：零值
* *type inference*：类型推断

### 8.4 零值（Zero Value）

| 类型       | 零值      |
| -------- | ------- |
| `int`    | `0`     |
| `string` | `""`    |
| `bool`   | `false` |
| 指针/切片    | `nil`   |

---

## 9. 🔗 Pointers（指针）

> 指针是“变量地址”的值。

### 9.1 `&` 和 `*`

```go
var x int = 1
var ip *int   // ip: pointer to int（指向 int 的指针）

ip = &x       // 取地址
fmt.Println(*ip) // 解引用，打印 1
```

* `&x`：取 `x` 的地址
* `*ip`：通过指针拿到实际值

### 9.2 `new` 函数

```go
ptr := new(int) // *int，指向一个值为 0 的 int
*ptr = 3
```

* `new(T)`：在堆上分配一个类型为 `T` 的零值，返回 `*T`

**对比：**

```go
var x int  // 栈上或堆上由编译器决定
x = 3

ptr := new(int)
*ptr = 3
```

---

## 10. 📍 Scope & Blocks（作用域与代码块）

### 10.1 Scope（作用域）

* package-level variables（包级变量）可以在同一包的所有文件内使用
* function-level variables（函数内变量）只能在该函数内部使用

```go
var x = 4 // package scope

func f() {
    fmt.Println(x) // OK
}

func g() {
    fmt.Println(x) // OK
}
```

### 10.2 Block（代码块）

任何 `{}` 包住的区域都是一个 block：

* function body
* if / for / switch / select 中的大括号
* case / default 内部

Go 有一系列隐式 block 层次（lexical scoping）：

1. universe block（内建标识符）
2. package block（包级）
3. file block（文件级）
4. if/for/switch/select block
5. case/default block

**Keyword**

* *lexical scoping*：词法作用域
* *shadowing*：遮蔽（内层同名变量覆盖外层访问）

---

## 11. 🧺 Stack, Heap & Garbage Collection（栈/堆与 GC）

### 11.1 Stack vs Heap

* **stack（栈）**

  * 为函数调用专用的内存区域
  * 函数返回时栈帧整体释放 → 快
* **heap（堆）**

  * 用于生命周期难以预测的对象
  * 需要 GC 管理

示例：

```go
func foo() *int {
    x := 1
    return &x // x 可能提升到堆上
}
```

编译器发现 `x` 的地址被返回，就不会简单放在栈上，而会安排到堆上，交给 GC 管理。

**Keywords**

* *escape analysis*：逃逸分析
* *stack frame*：栈帧

---

## 12. 💬 Comments（注释）

```go
// 单行注释（single-line comment）

/*
多行注释（multi-line comment）
*/
```

---

## 13. 🖨 fmt & Printing（输出）

```go
fmt.Printf("Hi %s\n", name)
fmt.Println("Hello", "Go")
```

常用格式化符号：

* `%d`：整数（decimal）
* `%s`：字符串（string）
* `%f`：浮点数（float）
* `%v`：通用占位符（default format）

---

## 14. 🔢 Integers（整数类型）

### 14.1 整数类型

* `int` / `uint`：位宽与平台有关（32 或 64 位）
* 指定位宽：

  * 有符号：`int8`, `int16`, `int32`, `int64`
  * 无符号：`uint8`, `uint16`, `uint32`, `uint64`

### 14.2 类型转换（Type Conversion）

```go
var x int32 = 1
var y int16 = 2

// x = y        // ❌ 不允许
x = int32(y)    // ✅ 显式转换
```

Go 对类型非常严格，即便都是整数也要显式转换。

---

## 15. 🌊 Floating Point & Complex（浮点与复数）

```go
var f32 float32 = 3.14
var f64 float64 = 3.1415926
var z complex128 = 1 + 2i
```

**Keywords**

* *float32 / float64*：单精度 / 双精度浮点数
* *complex64 / complex128*：复数类型

---

## 16. 🔤 ASCII, Unicode, Rune（字符编码）

* ASCII：早期字符编码，仅适合英文
* Unicode：统一字符集，每个字符对应一个 code point（码点）
* UTF-8：变长编码，兼容 ASCII，是 Go 字符串默认编码方式

在 Go 中：

* `rune` 是 `int32` 的别名，用来表示一个 Unicode 码点

```go
var r rune = '中'
fmt.Printf("%c\n", r) // 输出：中
```

---

## 17. 🧵 Strings（字符串）

* 字符串是 **不可变（immutable）** 的字节序列
* 通常是 UTF-8 编码文本

```go
s := "Hi there"
fmt.Println(s)
```

### 17.1 常用包：`strings` & `unicode` & `strconv`

**`strings` 包常用函数**

* `strings.ToUpper(s)` / `ToLower(s)`
* `strings.TrimSpace(s)`
* `strings.Contains(s, substr)`
* `strings.HasPrefix(s, prefix)`
* `strings.Split(s, sep)`
* `strings.Fields(s)`：按任意空白分割

**`unicode` 包**

* `unicode.IsDigit(r)`
* `unicode.IsLetter(r)`
* `unicode.IsSpace(r)`

**`strconv` 包**

* `strconv.Atoi(s)`：string → int
* `strconv.Itoa(i)`：int → string

---

## 18. 🔒 Constants & `iota`（常量与 iota）

```go
const x = 1.3

const (
    y = 4
    z = "Hi"
)
```

### 18.1 `iota` 自动枚举

```go
type Grade int

const (
    A Grade = iota // 0
    B              // 1
    C              // 2
    D              // 3
    F              // 4
)
```

**Keywords**

* *enumeration*：枚举
* *auto-increment*：自动递增

---

## 19. 🔁 Control Flow（控制流）

### 19.1 `if`

```go
if condition {
    // ...
} else if other {
    // ...
} else {
    // ...
}
```

### 19.2 `for`（Go 没有 `while`）

Go 只有一个循环关键字：`for`，可以表示：

* 经典 for 循环
* while 循环
* 无限循环

```go
// 经典 for
for i := 0; i < 10; i++ {
    fmt.Println(i)
}

// while 风格
for i < 10 {
    i++
}

// while true 风格（无限循环）
for {
    // ...
}
```

### 19.3 `switch`

```go
switch x {
case 1:
    fmt.Println("one")
case 2:
    fmt.Println("two")
default:
    fmt.Println("other")
}
```

**Tagless switch（无表达式 switch）：**

```go
switch {
case x > 1:
    // ...
case x < -1:
    // ...
default:
    // ...
}
```

### 19.4 `break` / `continue`

```go
for i := 0; i < 10; i++ {
    if i == 5 {
        break // 直接跳出整个循环
    }
}
```

```go
for i := 0; i < 10; i++ {
    if i == 5 {
        continue // 跳过本轮，继续下一轮
    }
    fmt.Println(i)
}
```

---

## 20. 📥 输入：`fmt.Scan`

```go
var appleNum int

fmt.Print("number of apples? ")
n, err := fmt.Scan(&appleNum)
fmt.Println("appleNum =", appleNum, "items read:", n, "err:", err)
```

* 注意传指针：`&appleNum`
* `n`：成功读取的参数个数
* `err`：错误信息（如 EOF、输入类型不匹配）

---

# 🧩 Complex Data Types（复杂数据类型）

---

## 21. 🧮 Arrays（数组）

> Fixed-length series of elements of the same type
> 固定长度、同类型元素的序列。

### 21.1 声明与初始化

```go
var x [5]int    // 长度为 5 的 int 数组，元素初始为 0
x[0] = 2
fmt.Println(x[1]) // 0
```

数组字面量（array literal）：

```go
var x [5]int = [5]int{1, 2, 3, 4, 5}
y := [...]int{1, 2, 3, 4} // [...] 让编译器推断长度 4
```

**关键词**

* *fixed length*：固定长度
* *index*：索引（从 0 开始）

### 21.2 遍历数组（range）

```go
x := [3]int{1, 2, 3}

for i, v := range x {
    fmt.Printf("index %d, value %d\n", i, v)
}
```

---

## 22. 🌊 Slices（切片）

> A slice is a window on an underlying array
> 切片是“基于数组的一扇窗口”，本质是对数组的一段视图。

### 22.1 核心属性（3 个）

1. **pointer**：指向底层数组开始位置（或中间位置）
2. **length（len）**：切片当前包含的元素个数
3. **capacity（cap）**：从切片起始位置到底层数组末尾最多可扩展的元素数量

```go
arr := [...]string{"a", "b", "c", "d", "e", "f", "g"}
s1 := arr[1:3] // b, c
s2 := arr[2:5] // c, d, e

fmt.Println(len(s1), cap(s1)) // len=2, cap=6（从 index 1 到 6 个元素）
fmt.Println(len(s2), cap(s2)) // len=3, cap=5（从 index 2 到 5 个元素）
```

> ✅ **重要理解：**
> `cap(slice) = len(underlying array) - start index of slice`
> 容量 = 底层数组长度 - 切片起始索引。

### 22.2 `len()` & `cap()`

```go
fmt.Println(len(s1)) // 当前长度
fmt.Println(cap(s1)) // 当前容量
```

### 22.3 声明切片

```go
sli := []int{1, 2, 3} // 一定是切片（slice），不是数组
```

### 22.4 使用 `make` 创建切片

```go
sli := make([]int, 10)       // len=10, cap=10
sli2 := make([]int, 10, 15)  // len=10, cap=15
```

**为什么要有 cap？**

* 初始容量越大，越不容易频繁扩容（reallocate underlying array）
* `append` 超过 cap 时，Go 会：

  * 分配更大的新数组
  * 把原数据复制过去
  * 返回指向新数组的切片

---

### 22.5 `append`（增加元素）

> ❓ 为什么文档说 `append` 适用于 slice，不说 array？
> 因为 **数组长度是固定的，不能动态增加**，而切片可变长。

```go
sli := make([]int, 0, 3)
sli = append(sli, 100)
sli = append(sli, 200, 300)
fmt.Println(sli) // [100 200 300]
fmt.Println(len(sli), cap(sli))
```

* `append` 返回一个新的切片（可能指向新的数组）
* 原切片扩容后，不再与老数组共享数据 → 这是 cap 的关键意义之一

**Keywords**

* *underlying array*：底层数组
* *resize / reallocate*：重新分配

---

## 23. 🔐 Maps（映射 / 哈希表）

> Hash table storing key-value pairs
> 使用哈希表实现的键值对存储。

### 23.1 声明与 `make`

```go
var idMap map[string]int     // 此时是 nil map，不可直接写入
idMap = make(map[string]int) // 分配内部哈希结构
```

或字面量：

```go
idMap := map[string]int{
    "joe": 23,
    "bob": 50,
}
```

**❓ 为什么要用 `make`？**

* `map`、`slice`、`chan` 属于需要运行时初始化的引用类型
* `make` 会为它们分配内部数据结构
* `var m map[...]...` 得到的是 `nil map`，对其赋值会 panic

### 23.2 基本操作

**增加/更新：**

```go
idMap["joe"] = 23
```

**删除：**

```go
delete(idMap, "joe")
```

**查询：**

```go
id, ok := idMap["joe"]
// id: 查询到的值
// ok: bool，true 表示 key 存在，false 表示 key 不存在
```

**长度：**

```go
fmt.Println(len(idMap))
```

**遍历：**

```go
for key, val := range idMap {
    fmt.Println(key, val)
}
```

**Keywords**

* *hash function*：哈希函数
* *bucket*：哈希桶

---

## 24. 🧱 Structs（结构体）

> A collection of fields (possibly of different types)
> 一组字段的组合，可以是不同类型。

### 24.1 定义结构体

```go
type Person struct {
    name  string
    addr  string
    phone string
}
```

> ⚠ 正确写法：`type Person struct { ... }`
> 不是 `type struct Person{}`。

### 24.2 使用结构体

**声明与赋值：**

```go
var p1 Person
p1.name = "Joe"
p1.addr = "A St."
p1.phone = "123456"
```

**字面量初始化：**

```go
p2 := Person{
    name:  "Ann",
    addr:  "B St.",
    phone: "987654",
}
```

**通过 `new`：**

```go
p3 := new(Person) // *Person
p3.name = "Bob"
```

---

# 🌐 Protocols & Formats（协议与格式）

---

## 25. 📜 RFC & Protocols

**RFC（Requests for Comments）**

* 定义互联网协议的文档标准
* 例子：

  * HTML – RFC 1866
  * URI – RFC 3986
  * HTTP – RFC 2616 (旧版)

Go 提供了对网络协议的支持库。

**`net/http` 包：**

```go
import "net/http"

resp, err := http.Get("https://www.uci.edu")
// ...
```

**`net` 包：低层 TCP/IP socket 编程：**

```go
import "net"

conn, err := net.Dial("tcp", "uci.edu:80")
// ...
```

---

## 26. 📦 JSON（JavaScript Object Notation）

* 文本格式（text-based）
* key-value pairs（键值对）
* 人类可读（human-readable）
* 紧凑（compact）
* 类型可以递归组合（recursively composed）

### 26.1 Go struct ↔ JSON

```go
type Person struct {
    Name  string `json:"name"`
    Addr  string `json:"addr"`
    Phone string `json:"phone"`
}
```

### 26.2 Marshaling（编码）

```go
import "encoding/json"

p1 := Person{Name: "Joe", Addr: "A St.", Phone: "123"}
barr, err := json.Marshal(p1)
// barr 是 []byte，包含 JSON 文本
fmt.Println(string(barr))
```

### 26.3 Unmarshaling（解码）

```go
var p2 Person
err := json.Unmarshal(barr, &p2)
// 将 JSON 字节数组转换为 Go 结构体
```

**Keywords**

* *marshal*：序列化（编码）
* *unmarshal*：反序列化（解码）

---

# 📂 File Access（文件访问）

---

## 27. 📖 `ioutil` / `os` 文件读写

> 课程中常用 `ioutil` 示例，但在新版本 Go 中推荐改用 `os` / `io` / `os.ReadFile`。

### 27.1 一次性读完整个文件

传统写法（旧）：

```go
import "io/ioutil"

data, err := ioutil.ReadFile("test.txt")
```

新写法（推荐）：

```go
data, err := os.ReadFile("test.txt")
if err != nil {
    // handle error
}
fmt.Println(string(data))
```

### 27.2 一次性写入文件

```go
err := os.WriteFile("outfile.txt", data, 0777)
// 0777 是 Unix 风格的权限（permission bits）
```

---

## 27.3 使用 `os` 更底层的读写

```go
f, err := os.Open("dt.txt") // 只读打开
if err != nil {
    // handle error
}
defer f.Close()

barr := make([]byte, 10)   // buffer
n, err := f.Read(barr)     // 读至多 10 字节到 barr 中
fmt.Println(n, string(barr[:n]))
```

写入文件示例：

```go
f, err := os.Create("out.txt") // 创建或截断
if err != nil {
    // handle error
}
defer f.Close()

n, err := f.Write([]byte("Hello Go\n"))
n2, err := f.WriteString("Another line\n")
```

**Keywords**

* *open / close / read / write*：打开 / 关闭 / 读 / 写
* *seek*：移动读写指针（read/write head）

---

# ✅ 本节重点回顾

1. **cap 是什么？**

   * `cap(slice)` = 从切片起点到底层数组末尾最多可用元素数量
   * 影响 `append` 是否需要扩容（重新分配数组）

2. **为什么 `append` 针对 slice，而不是 array？**

   * 数组长度固定，不能增加
   * 切片是动态视图，可以扩展长度 → `append` 设计给 slice 用

3. **为什么 map / slice 要用 `make`？**

   * 需要在运行时分配内部结构（底层数组 / 哈希表桶）
   * `var m map[...]...` 是 `nil map`，必须用 `make` 才能写入

4. **数组 vs 切片一句话对比：**

   * array：固定长度，值类型，作为整体传递
   * slice：基于数组的动态视图，有 len/cap，可以 `append`，引用语义

---
