1번 던져서 나오는 숫자를 $Y$라고 하자. 주사위의 각 면이 나올 확률이 같으므로

$$\mathbb{E}[Y]=\frac{-2+0+2+3+4+5}{6}=2$$

이다.

주사위를 10번 던져 얻은 숫자를 각각 $Y_1, Y_2, \ldots, Y_{10}$이라 하면

$$X=Y_1Y_2\cdots Y_{10}$$

이다. 각 시행은 independent이므로,

$$\mathbb{E}[X]=\mathbb{E}[Y_1Y_2\cdots Y_{10}]=\mathbb{E}[Y_1]\mathbb{E}[Y_2]\cdots \mathbb{E}[Y_{10}]$$

이다. 

모든 $Y_i$는 같은 분포를 가지므로,

$$\mathbb{E}[X]=\left(\mathbb{E}[Y]\right)^{10}=2^{10}=1024$$

이다. 따라서 정답은 $1024$이다.