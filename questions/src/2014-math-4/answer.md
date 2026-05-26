$V$의 원소들을 열벡터로 가지는 행렬을 $M_V = \begin{pmatrix} v_1 & v_2 & v_3 \end{pmatrix} \quad (m \times 3)$

$W$의 원소들을 행벡터로 가지는 행렬을 $M_W^T = \begin{pmatrix} w_1^T \\ w_2^T \\ w_3^T \end{pmatrix} \quad (3 \times n)$

라고 두면, $A$는 다음과 같이 표현된다.

$$A = M_V M_W^T$$

$$A_j = (w_1)_j v_1 + (w_2)_j v_2 + (w_3)_j v_3 \in \text{span}\{v_1, v_2, v_3\}$$

에서, $\text{Col}(A) \subseteq V$이다.

$\text{rank}(M_W^T)=3$이므로 $M_W^T$는 surjective한 성질을 가진다.

$$\therefore \text{rank}(A) = \dim(\text{Col}(A)) = \dim(V) = 2$$