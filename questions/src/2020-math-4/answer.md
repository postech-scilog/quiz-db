위치 에너지 변화가 이동 경로에 independent하다는 것은 중력장이 conservative field라는 뜻이다.

힘장을 $\mathbf{F}$라고 하면, 위치 에너지 변화는 $$\Delta U = -\int_{\mathbf{a}}^{\mathbf{b}} \mathbf{F}\cdot d\mathbf{r}$$로 나타낼 수 있다. 이 값이 경로에 의존하지 않으려면 $\mathbf{F}$가 어떤 potential function의 gradient로 표현되어야 한다. $$\mathbf{F}=-\nabla U$$또한 gradient field의 curl은 항상 $\mathbf{0}$이다. $$\nabla \times \nabla U = \mathbf{0}$$따라서 (1)과 (4)는 이 현상과 직접 관련이 있다.

Stokes' theorem에 의해 $$\oint_{\partial S} \mathbf{F}\cdot d\mathbf{r}=\iint_S (\nabla \times \mathbf{F})\cdot \mathbf{n}\,dS$$이다. 따라서 $\nabla \times \mathbf{F}=\mathbf{0}$이면 닫힌 경로를 따른 선적분이 $0$이 되고, 이는 path independence와 연결된다.

따라서 (2)도 관련이 있다.

반면 $$\Delta \left(\frac{1}{\lvert \mathbf{x} \rvert}\right)=-4\pi \delta(\mathbf{x})$$는 $\frac{1}{\lvert \mathbf{x}\rvert}$가 Laplacian의 fundamental solution이라는 사실과 관련된다. 이는 gravitational potential이나 Poisson equation과는 관련이 있지만, path independence를 설명하는 핵심 성질은 아니다.
따라서 (3)은 관련이 크지 않고, 정답은 \*\*(3)\*\*이다.