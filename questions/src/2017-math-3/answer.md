문제의 조건상, B는 C의 딱 하나의 성분(n행n열의 원소)에만 2016을 더한 행렬이다.

우선 C는 파스칼 행렬(Pascal matrix)으로, C의 행렬식은 1이 됨이 알려져 있다.

자세하게는 C를 LU분해하면 파스칼 삼각형과 같은 형태의 상삼각행렬, 하삼각행렬이 나오는데, 이들의 대각성분이 모두 1이기 때문에 det(L)=det(U)=1이고, det(C)=det(L)det(U)=1이다.

이제 B를 본다. B의 행렬식을 구하기 위해, 행렬식의 여인수분해(cofactor expansion)를 생각하자. 그러면

$$\det B=\sum_{i=1}^nB_{in}\det M_{in}$$

여기서 M\_{in}은 행렬의 i번째 행, n번째 열을 제거해서 나온 (n-1)×(n-1) 행렬(minor matrix)이다.

그런데 여기서

$$\det B=\sum_{i=1}^nB_{in}\det M_{in}=\sum_{i=1}^nC_{in}\det M_{in}+2016\det M_{nn}=\sum_{i=1}^nC_{in}\det M_{in}+2016\det C'\\
=\det C +2016 \det C'$$이다. C'은 C와 동일한 방식으로 정의된 (n-1)×(n-1) 행렬이다. 그러므로, det(C')=1이다.

따라서 det(B)=2017이다.