주어진 적분은 해석학에서 중요한 이변수함수, 베타 함수(Beta function)이다. 이 적분값은 B(m, n)으로 표현되며, 그 값는 n!m!/(m+n+1)!으로 알려져 있다.

계산은 다음과 같다. 주어진 적분을 I(m,n)으로 두자. 부분적분으로 전개하면

$$I(m, n) = \left[ \frac{x^{m+1}}{m+1}(1-x)^n \right]_0^1 - \int_0^1 \frac{x^{m+1}}{m+1} \cdot n(1-x)^{n-1}(-1) dx$$

이를 응용하면 다음 점화식을 얻는다.

$$I(m, n) = \frac{n}{m+1} \int_0^1 x^{m+1}(1-x)^{n-1} dx = \frac{n}{m+1} I(m+1, n-1)$$

따라서

$$I(m, n) = \frac{n \cdot (n-1) \cdot \dots \cdot 1}{(m+1) \cdot (m+2) \cdot \dots \cdot (m+n)} I(m+n, 0)$$

이제 I(m+n, 0)을 계산하자.

$$I(m+n, 0) = \int_0^1 x^{m+n} dx = \left[ \frac{x^{m+n+1}}{m+n+1} \right]_0^1 = \frac{1}{m+n+1}$$

이므로, 최종적으로 다음 식을 얻고 이것이 답이 된다.

$$I(m, n) = \frac{n!}{(m+1)(m+2)\dots(m+n)(m+n+1)} = \frac{m! \, n!}{(m+n+1)!}$$
