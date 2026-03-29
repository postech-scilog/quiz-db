1. RSA는 NP이면서 P가 아니라고 추정되는 문제인 소인수분해에 의존합니다. Shor's algorithm을 이용하면
   양자컴퓨터에서 소인수분해를 다항시간 안에 해결할 수 있습니다.
2. 타원 곡선 암호 (Elliptic-curve cryptography) 또한 Shor's algorithm을 이용한 공격이 가능하다고
   알려져 있습니다.
3. McEliece 암호는 양자컴퓨터를 이용한 공격을 고려한 post-quantum cryptography 중 하나입니다.
4. AES-128은 양자 알고리즘 중 하나인 Grover's algorithm을 이용한 공격에 취약한 것으로 알려져
   있습니다. 해당 알고리즘은 임의의 함수에 대해 주어진 값을 출력하도록 하는 입력값을 높은 확률로
   찾아내는 알고리즘으로, 함수의 domain의 크기가 N이라고 했을 때 O(sqrt(N)) 만에 동작합니다. AES-128
   은 작은 키 사이즈로 인해 이 알고리즘에 의한 공격에 취약한 반면 AES-256은 그렇지 않은 것으로 알려져
   있습니다.