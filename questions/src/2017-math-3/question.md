자연수 n에 대해 n×n 이항계수행렬 C를 다음과 같이 정의한다.

$$C_{ij}=\binom {i+j-2}{i-1} = \frac{(i+j-2)!}{(i-1)!(j-1)!},\ \  1\leq i, j \leq n$$

이제 이 행렬 C를 이용하여 새로운 n×n 행렬 B를 정의한다.

$$B_{ij}= C_{ij} \ \ \ \ \text{if} \  1\leq i, j \leq n-1 $$

$$B_{in}= B_{ni}=C_{in} \ \ \ \ \text{if} \  1\leq i \leq n-1 $$

$$B_{ij}= C_{ij}+2016 \ \ \ \ \text{if} \   i=j=n $$

B의 행렬식을 구하라.