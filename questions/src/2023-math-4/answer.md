가정에 의해 $\lambda_i\to\infty$인 임의의 수열에 대해

$$f_{\lambda_i}(x)=\lambda_i f\left(\frac{x}{\lambda_i}\right)$$

가 locally uniformly $0$으로 수렴한다.

먼저 $x=0$을 대입하면

$$f_{\lambda_i}(0)=\lambda_i f(0)$$

이다. 이것이 $0$으로 수렴해야 하므로

$$f(0)=0$$

이다.

이제 $f'(0)=0$임을 보이자. 임의의 수열 $h_i\to0$, $h_i\ne0$를 잡고

$$\lambda_i=\frac{1}{|h_i|}$$

라고 두자. 그러면 $\lambda_i\to\infty$이고,

$$h_i=\frac{\operatorname{sgn}(h_i)}{\lambda_i}$$

이다.

가정에 의해 $f_{\lambda_i}\to0$ locally uniformly on $\mathbb{R}$이므로, 특히 compact set $\{-1,1\}$ 위에서 uniform하게 $0$으로 수렴한다. 따라서

$$f_{\lambda_i}(\operatorname{sgn}(h_i))\to0$$

이다. 그런데

$$f_{\lambda_i}(\operatorname{sgn}(h_i))=\lambda_i f\left(\frac{\operatorname{sgn}(h_i)}{\lambda_i}\right)=\lambda_i f(h_i)$$

이므로

$$\lambda_i f(h_i)\to0$$

이다.

따라서 $f(0)=0$을 이용하면

$$\left|\frac{f(h_i)-f(0)}{h_i}\right|=\left|\frac{f(h_i)}{h_i}\right|=\lambda_i |f(h_i)|\to0$$

이다. 즉,

$$\frac{f(h_i)-f(0)}{h_i}\to0$$

이다.

이는 임의의 수열 $h_i\to0$, $h_i\ne0$에 대해 성립하므로, $f$는 $0$에서 differentiable하고

$$f'(0)=0$$

이다.

따라서 정답은 **True**이다.