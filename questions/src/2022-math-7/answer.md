각 동전에서 나온 앞면의 수를 각각 $X,Y$라고 하자.

$$X,Y \sim \operatorname{Bin}\left(3,\frac{1}{2}\right)$$

이고, $X$와 $Y$는 independent이다.

따라서

$$\mathbb{P}(X=Y)=\sum_{k=0}^{3}\mathbb{P}(X=k)\mathbb{P}(Y=k)$$

이다. 각 $k$에 대해

$$\mathbb{P}(X=k)=\binom{3}{k}\left(\frac{1}{2}\right)^3$$

이므로,

$$\mathbb{P}(X=Y)=\sum_{k=0}^{3}\left(\binom{3}{k}\left(\frac{1}{2}\right)^3\right)^2$$

$$=\frac{1}{64}\sum_{k=0}^{3}\binom{3}{k}^2$$

이다. 따라서

$$\mathbb{P}(X=Y)=\frac{1}{64}\left(\binom{3}{0}^2+\binom{3}{1}^2+\binom{3}{2}^2+\binom{3}{3}^2\right)$$

$$=\frac{1}{64}(1+9+9+1)=\frac{20}{64}=\frac{5}{16}$$

이다.

따라서 정답은 $\frac{5}{16}$이다.