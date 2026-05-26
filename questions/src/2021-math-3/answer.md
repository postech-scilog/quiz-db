(1) Open unit disk에서 유한 개의 점을 제거한 공간을 생각하자. 제거된 점들을 각각 한 번씩 감싸는 loop들을 잡으면, 이 loop들이 fundamental group을 generate한다. 제거된 점의 개수를 $n$이라고 하면 이 fundamental group은 free group $F_n$과 동형이다.

$$\pi_1(D^2 \setminus \{p_1,\ldots,p_n\}) \cong F_n$$

따라서 (1)은 finitely generated이다.

(2) $SL_2(\mathbb{Z})$는 finitely generated group이다. 실제로 다음 두 행렬로 generate된다.

$$S=\begin{pmatrix}0&-1\\1&0\end{pmatrix},\ T=\begin{pmatrix}1&1\\0&1\end{pmatrix}$$

이는 $SL_2(\mathbb{Z})$의 complex upper half-plane 위의 Möbius action과 그 fundamental domain을 통해 이해할 수 있다.

따라서 (2)는 finitely generated이다.

(3) $\mathbb{C}^{\times}$는 $0$이 아닌 complex number들의 multiplication group이다. 이 group은 abelian group이고 uncountable하다. 하지만 finitely generated abelian group은 countable일 수밖에 없다.

따라서 (3)은 finitely generated가 아니다.

(4) Monster group은 finite group이다. 모든 finite group은 자기 원소 전체를 generator로 잡을 수 있다.

따라서 (4)는 finitely generated이다.

따라서 finitely generated 하지 않은 group은 (3) $\mathbb{C}^{\times}$뿐이다.