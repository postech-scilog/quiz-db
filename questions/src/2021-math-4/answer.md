(1)

행렬 $\mathbf{A}$는 다음과 같이 쓸 수 있다.

$$\mathbf{A}=\begin{pmatrix}1\\1\\1\end{pmatrix}\begin{pmatrix}1&2&3\end{pmatrix}$$

따라서 $\mathbf{A}$는 rank-one matrix이다.

먼저

$$\mathbf{v}=\begin{pmatrix}1\\1\\1\end{pmatrix}$$

에 대해

$$\mathbf{A}\mathbf{v}=\begin{pmatrix}6\\6\\6\end{pmatrix}=6\mathbf{v}$$

이므로 $6$은 eigenvalue이다.

또한 $\mathbf{A}$의 rank가 $1$이므로 nullity는 $2$이다. 따라서 $0$에 대한 eigenspace의 dimension은 $2$이다. 실제로

$$\mathbf{A}\begin{pmatrix}x\\y\\z\end{pmatrix}=\begin{pmatrix}x+2y+3z\\x+2y+3z\\x+2y+3z\end{pmatrix}$$

이므로 $0$에 대한 eigenspace는

$$E_0=\left\{\begin{pmatrix}x\\y\\z\end{pmatrix}:x+2y+3z=0\right\}$$

이다. 따라서 $0$의 geometric multiplicity는 $2$이다.

한편 $\mathbf{A}$의 trace는

$$\operatorname{tr}(\mathbf{A})=1+2+3=6$$

이고, eigenvalue들의 합은 trace와 같으므로 eigenvalue들은

$$6,\ 0,\ 0$$

이다. 따라서 algebraic multiplicity는

$$6:\ 1,\;0:\ 2$$

이다.

(2)

이제 각 eigenvalue의 geometric multiplicity를 보면, $6$에 대한 eigenspace의 dimension은 $1$이고, $0$에 대한 eigenspace의 dimension은 $2$이다. 이들의 합이

$$1+2=3$$

이므로 $\mathbb{R}^3$의 basis를 이루는 eigenvector들을 잡을 수 있다. 따라서 $\mathbf{A}$는 diagonalizable이다.