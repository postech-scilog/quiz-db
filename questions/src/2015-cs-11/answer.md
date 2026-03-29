다형성은 유연한 타입 시스템의 구현을 위해 널리 사용되는 개념입니다.
다형성은 다양한 형태로 구현될 수 있으며, 그 분류는 다음과 같습니다.

* **Ad hoc polymorphism**: 한 함수가 여러 타입의 인자를 허용하는 경우
* **Parametric polymorphism**: 추상적인 심볼을 사용해서 타입을 나타내는 경우
* **Subtyping**: 클래스의 이름이 그 클래스의 서브클래스의 인스턴스들을 나타내는 경우

C++에서는 위 세가지 형태의 다형성을 모두 찾아볼 수 있습니다.

우선 함수 오버로딩(function overloading) 은 ad hoc polymorphism에 해당합니다. 다음 코드의 함수
`add`는 `short` 및 `int` 타입에 모두 적용될 수 있습니다. 따라서 함수 `add`의 타입은
`(int, int) -> int` 이거나 `(int, int, int) -> int` 라고 할 수 있습니다. 한 함수가 여러 타입에
속하므로 다형성을 찾아볼 수 있습니다.

```cpp
int add(int a, int b);

int add(int a, int b, int c);
```

Parametric polymorphism은 템플릿에 해당됩니다. 다음 코드의 `add` 함수는 인자의 타입을 템플릿 변수
`T` 로 추상적으로 나타내었습니다. 이 `T`가 구체적으로 어떤 타입이 되느냐는 호출 시에 결정되며,
따라서 `add` 함수의 타입은 `(int, int) -> int` 일수도, `(short, short) -> short` 일수도
있습니다. 한 함수가 여러 타입에 속하므로 이 또한 다형성의 한 예입니다.

```cpp
template <typename T>
T add(T a, T b) {
  return a + b;
}
```

마지막으로 subtyping은 클래스들의 관계에서 찾아볼 수 있습니다. 아래 코드의 클래스 `Human`은 클래스
`Animal`의 서브클래스이기 때문에, `Human`의 인스턴스 `james` 는 `Human` 타입이며 동시에 `Animal`
타입입니다. 한 값이 여러 타입에 속하므로 다형성에 해당합니다.

```cpp
#include <string>
#include <iostream>

class Animal {
public:
  std::string name;  
};

class Human : public Animal {};

std::string name_of_animal(Animal x) {
  return x.name;
}

std::string name_of_human(Human x) {
  return x.name;
}

int main() {
  Human james = { "james" };
  std::cout << name_of_animal(james) << std::endl;
  std::cout << name_of_human(james) << std::endl;
  return 0;
}
```