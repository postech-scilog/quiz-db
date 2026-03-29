정렬 알고리즘은 average case의 시간 복잡도에 따라서 효율적인 알고리즘과 비효율적인 알고리즘으로
분류할 수 있다.

비효율적인 알고리즘에는 bubble sort, insertion sort, selection sort가 대표적이며, 해당
알고리즘들의 average 및 worst 시간 복잡도는 모두 O(n^2) 이다.

효율적인 알고리즘에는 heap sort, quicksort, merge sort가 대표적이다.
이 알고리즘들은 모두 average case에서 O(n log n) 시간 복잡도를 가진다.
하지만 worst case의 경우 quicksort는 O(n^2), 나머지는 O(n log n) 시간 복잡도를 가진다.

quicksort는 이렇게 수학적으로 분석 시 좋지 않은 특성을 가지고 있지만 실제로는 다른 알고리즘들보다
평균적으로 빠르기 때문에 널리 사용되어 왔다. C standard library의 `qsort` 함수와 Java의 레퍼런스 구현이
quicksort를 기본적으로 사용한다.

quicksort의 개발자인 Tony Hoare는 1980년 튜링상을 수상했다는 사실도 알아두자.