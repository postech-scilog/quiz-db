$z=0$에서의 단면을

$$E=\{(x,y)\in\mathbb{R}^2\mid x^2+4y^2\le 1\}$$

라고 하자. 조건 (i)에 의해

$$C\cap\{z=0\}=E\times\{0\}$$

이다. 이 타원 $E$의 반지름은 각각 $1$, $\frac12$이므로 넓이는

$$\operatorname{area}(E)=\pi\cdot 1\cdot \frac12=\frac{\pi}{2}$$

이다.

이제 높이 $z$에서의 단면을

$$C_z=\{(x,y)\in\mathbb{R}^2\mid (x,y,z)\in C\}$$

라고 하자. 우리는 모든 $z$에 대해, 넓이의 관점에서 $C_z$가 $E$와 같음을 보이면 된다.

먼저 $C_z\subseteq E$임을 보이자. 만약 어떤 $(x,y,z)\in C$가

$$x^2+4y^2>1$$

을 만족한다고 하자. $C$는 $z$-axis를 포함하므로, 임의의 $t\in\mathbb{R}$에 대해 $(0,0,t)\in C$이다. Convexity에 의해 $(x,y,z)$와 $(0,0,t)$를 잇는 선분은 모두 $C$에 들어간다.

이때 적절한 $t$를 고르면 이 선분은 $xy$-plane과 만나고, 그 교점은

$$(\alpha x,\alpha y,0)$$

꼴로 쓸 수 있다. 여기서 $\alpha\in(0,1)$을 $1$에 충분히 가깝게 잡을 수 있다. 그러면

$$(\alpha x)^2+4(\alpha y)^2>1$$

이므로, $C\cap\{z=0\}$가 $E\times\{0\}$보다 커지게 된다. 이는 조건 (i)에 모순이다. 따라서 모든 $z$에 대해

$$C_z\subseteq E$$

이다.

반대로 $E$의 내부는 모든 $C_z$에 포함됨을 보이자. $x^2+4y^2<1$인 $(x,y)$와 임의의 $z$를 잡자. $\alpha\in(0,1)$을 $1$에 충분히 가깝게 잡으면

$$\left(\frac{x}{\alpha}\right)^2+4\left(\frac{y}{\alpha}\right)^2\le 1$$

이므로

$$\left(\frac{x}{\alpha},\frac{y}{\alpha},0\right)\in C$$

이다. 또한 $C$는 $z$-axis를 포함하므로

$$\left(0,0,\frac{z}{1-\alpha}\right)\in C$$

이다. Convexity에 의해 이 두 점의 convex combination도 $C$에 속하고,

$$\alpha\left(\frac{x}{\alpha},\frac{y}{\alpha},0\right)+(1-\alpha)\left(0,0,\frac{z}{1-\alpha}\right)=(x,y,z)$$

이다. 따라서

$$(x,y,z)\in C$$

이고, 이는 $E$의 내부가 $C_z$에 포함된다는 뜻이다.

결국 모든 $z$에 대해

$$\operatorname{int}(E)\subseteq C_z\subseteq E$$

이다. 따라서 각 높이에서의 단면 넓이는 항상

$$\operatorname{area}(C_z)=\operatorname{area}(E)=\frac{\pi}{2}$$

이다.

그러므로 $-1\le z\le 1$ 영역 내의 부피는

$$\int_{-1}^{1}\operatorname{area}(C_z)\,dz=\int_{-1}^{1}\frac{\pi}{2}\,dz=\pi$$

이다.

따라서 정답은 (2) $\pi$이다.