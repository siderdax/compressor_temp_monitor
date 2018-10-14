컴프레서 온도 모니터
========

### 준비물

라즈베리 파이, 아두이노(프로 미니), 온도 센서(DS1820)

### 설치

#### H/W 연결

라즈베리 파이 ┬ 아두이노 ─ 온도 센서

​                      ├ 아두이노 ─ 온도 센서

​                     └ 아두이노 ─ 온도 센서

#### 아두이노 F/W 설치

Arduino IDE를 이용해 ``Arduino/temp_reader/temp_reader.ino``를 열고 **COMPTEMP_ID** 값을 중복되지 않게 아두이노마다 변경해서 업로드한다.

#### 라즈베리 파이 S/W 설치

```shell
$ git clone https://bitbucket.org/measureaid/compressor_temp_monitor.git
$ cd compressor_temp_monitor
$ npm install
```

``./config/config.js`` 안에 **config.hp50, config.hp75, config.hp100** 값을 아두이노 **COMPTEMP_ID** 값과 맞춰 준다.

### 실행

라즈베리 파이에서 node 실행

```shell
$ node main.js
```

웹브라우저에서 "http://라즈베리파이주소:3000"로 온도 상황을 볼 수 있음