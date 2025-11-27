-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: music_db
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_messages` (
  `message_id` bigint NOT NULL AUTO_INCREMENT,
  `room_id` int NOT NULL,
  `sender_id` int NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`),
  KEY `room_id` (`room_id`),
  KEY `sender_id` (`sender_id`),
  CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `chat_rooms` (`room_id`) ON DELETE CASCADE,
  CONSTRAINT `chat_messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
INSERT INTO `chat_messages` VALUES (1,1,7,'하이','2025-11-17 10:02:34'),(2,1,2,'하이','2025-11-17 10:03:32'),(3,1,2,'11','2025-11-17 10:10:11'),(4,1,2,'ㅁㄴㅇㅁㄴㅇ','2025-11-17 10:18:37'),(5,2,2,'ㅎㅇ','2025-11-18 01:31:20'),(6,2,2,'너 뭐함','2025-11-18 01:32:18'),(7,2,2,'뭐하냐 너','2025-11-18 02:41:22'),(8,2,1,'ㅎㅇ','2025-11-18 02:41:30'),(9,2,2,'이러면 어떻게 나와?','2025-11-18 21:21:07'),(10,2,2,'https://youtu.be/sEQf5lcnj_o?si=t-SADeiaTBj3MCzp','2025-11-18 21:22:23'),(11,2,1,'이노래','2025-11-18 21:31:42'),(12,2,1,'진짜 좋더라고요 ㅠㅠ','2025-11-18 21:31:43'),(13,2,2,'ㅁㄴㅇ','2025-11-18 21:32:16'),(14,2,2,'이거 기록 남네요?','2025-11-18 21:47:43'),(15,2,1,'ㅁㄴㅇㅁㄴㅇ','2025-11-18 21:56:15'),(16,2,1,'ㅁㄴㅇ','2025-11-18 21:57:07'),(17,2,1,'ㅁㄴㅇ','2025-11-18 21:58:59'),(18,2,1,'ㅁㄴㅇ','2025-11-18 22:03:00'),(19,2,1,'ㅁㄴㅇ','2025-11-18 22:04:45'),(20,2,1,'이거나 먹어라','2025-11-18 22:06:04'),(21,2,1,'ㅁㄴㅇ','2025-11-18 22:07:17'),(22,2,1,'ㅁㄴㅇㅁㄴㅇ','2025-11-18 22:07:47'),(23,2,1,'ㅁㄴㅇ','2025-11-18 22:08:08'),(24,2,2,'https://www.youtube.com/watch?v=p3Xphd_nV6g&list=RDp3Xphd_nV6g&start_radio=1','2025-11-19 01:06:55'),(25,2,2,'야 임마','2025-11-21 06:44:15');
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_rooms`
--

DROP TABLE IF EXISTS `chat_rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chat_rooms` (
  `room_id` int NOT NULL AUTO_INCREMENT,
  `user_one_id` int NOT NULL,
  `user_two_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`room_id`),
  UNIQUE KEY `uq_chat_pair` (`user_one_id`,`user_two_id`),
  KEY `user_two_id` (`user_two_id`),
  CONSTRAINT `chat_rooms_ibfk_1` FOREIGN KEY (`user_one_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_rooms_ibfk_2` FOREIGN KEY (`user_two_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_rooms`
--

LOCK TABLES `chat_rooms` WRITE;
/*!40000 ALTER TABLE `chat_rooms` DISABLE KEYS */;
INSERT INTO `chat_rooms` VALUES (1,2,7,'2025-11-17 10:02:27'),(2,1,2,'2025-11-18 01:31:13'),(3,2,14,'2025-11-21 06:46:29'),(4,2,15,'2025-11-21 06:48:46');
/*!40000 ALTER TABLE `chat_rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `comment_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `playlist_id` int NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `like` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`comment_id`),
  KEY `user_id` (`user_id`),
  KEY `playlist_id` (`playlist_id`),
  CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`playlist_id`) REFERENCES `user_playlists` (`playlist_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=181 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (81,1,1,'KICK BACK 폼 미쳤다',22,'2025-11-05 13:43:12'),(82,2,1,'체인소맨 극장판 기대중!',5,'2025-11-05 13:43:12'),(83,3,1,'켄시 요네즈 음색... GOAT',8,'2025-11-05 13:43:12'),(84,4,1,'포치타 ㅠㅠ',12,'2025-11-05 13:43:12'),(85,5,1,'이거 듣고 톱맨 됐습니다',3,'2025-11-05 13:43:12'),(86,6,1,'마키마...',7,'2025-11-05 13:43:12'),(87,7,1,'덴지 불쌍해',9,'2025-11-05 13:43:12'),(88,8,1,'파워!!!',4,'2025-11-05 13:43:12'),(89,9,1,'매일 듣는 중',6,'2025-11-05 13:43:12'),(90,10,1,'노래 중독성 미쳤음',15,'2025-11-05 13:43:12'),(91,1,2,'새벽에 듣기 좋은 감성',11,'2025-11-05 13:43:14'),(92,2,2,'이거 듣고 꿀잠잠',8,'2025-11-05 13:43:14'),(93,3,2,'비 오는 날 창밖 보면서 듣는 중',19,'2025-11-05 13:43:14'),(94,4,2,'마음이 편안해지네요',7,'2025-11-05 13:43:14'),(95,5,2,'선곡이 다 좋네요',13,'2025-11-05 13:43:14'),(96,6,2,'힐링 그 자체',6,'2025-11-05 13:43:14'),(97,7,2,'조용히 책 읽을 때 최고',9,'2025-11-05 13:43:14'),(98,8,2,'이런 플리 더 만들어주세요',10,'2025-11-05 13:43:14'),(99,9,2,'퇴근길에 들으면 딱',5,'2025-11-05 13:43:14'),(100,10,2,'감성 충전하고 갑니다',14,'2025-11-05 13:43:14'),(101,1,3,'공부할 때 듣기 딱 좋네요',17,'2025-11-05 13:43:16'),(102,2,3,'로파이 라디오는 여기가 최고',11,'2025-11-05 13:43:16'),(103,3,3,'과제용 브금으로 저장',8,'2025-11-05 13:43:16'),(104,4,3,'냥이 귀여워',5,'2025-11-05 13:43:16'),(105,5,3,'하루 종일 틀어놓습니다',9,'2025-11-05 13:43:16'),(106,6,3,'스트레스 받을 때 들으면 최고',13,'2025-11-05 13:43:16'),(107,7,3,'밤에 듣기 좋아요',6,'2025-11-05 13:43:16'),(108,8,3,'선곡 센스 미쳤음',4,'2025-11-05 13:43:16'),(109,9,3,'커피 마시면서 듣는 중',10,'2025-11-05 13:43:16'),(110,10,3,'마음이 안정돼요',15,'2025-11-05 13:43:16'),(111,1,4,'가사가 완전 내 얘기...',20,'2025-11-05 13:43:20'),(112,2,4,'이별한 사람들 다 모여라',14,'2025-11-05 13:43:20'),(113,3,4,'노래방 가고싶다',9,'2025-11-05 13:43:20'),(114,4,4,'눈물 한 바가지 쏟고 갑니다',11,'2025-11-05 13:43:20'),(115,5,4,'새벽에 들으면 안되는 노래들',7,'2025-11-05 13:43:20'),(116,6,4,'역시 한국 발라드가 최고',16,'2025-11-05 13:43:20'),(117,7,4,'와... 띵곡만 모아놨네',10,'2025-11-05 13:43:20'),(118,8,4,'전주 1초 듣고 울었다',8,'2025-11-05 13:43:20'),(119,9,4,'목소리 미쳤다',5,'2025-11-05 13:43:20'),(120,10,4,'옛날 생각나네요',13,'2025-11-05 13:43:20'),(121,1,5,'재즈힙합은 누자베스가 유일하다',25,'2025-11-05 13:43:23'),(122,2,5,'Luv(sic) 시리즈는 다 들어봐야 함',18,'2025-11-05 13:43:23'),(123,3,5,'Nujabes... R.I.P',30,'2025-11-05 13:43:23'),(124,4,5,'Aruarian Dance는 전설이지',22,'2025-11-05 13:43:23'),(125,5,5,'사무라이 참프루 생각나네',15,'2025-11-05 13:43:23'),(126,6,5,'비 오는 날 필수',10,'2025-11-05 13:43:23'),(127,7,5,'이런 감성 너무 좋아',9,'2025-11-05 13:43:23'),(128,8,5,'마음이 정화되는 느낌',13,'2025-11-05 13:43:23'),(129,9,5,'Reflection Eternal 최고',11,'2025-11-05 13:43:23'),(130,10,5,'들을 때마다 기분이 좋아져요',17,'2025-11-05 13:43:23'),(131,1,6,'King of Pop',40,'2025-11-05 13:43:26'),(132,2,6,'문워크... 그립습니다',25,'2025-11-05 13:43:26'),(133,3,6,'Smooth Criminal 비트 미쳤음',18,'2025-11-05 13:43:26'),(134,4,6,'Billie Jean은 시대를 초월한 명곡',33,'2025-11-05 13:43:26'),(135,5,6,'팝의 황제',20,'2025-11-05 13:43:26'),(136,6,6,'이길 사람이 없다',15,'2025-11-05 13:43:26'),(137,7,6,'어릴 때 이거 보고 춤췄는데',12,'2025-11-05 13:43:26'),(138,8,6,'Thriller 뮤비는 충격 그 자체였지',19,'2025-11-05 13:43:26'),(139,9,6,'Heal the World',10,'2025-11-05 13:43:26'),(140,10,6,'MJ FOREVER',28,'2025-11-05 13:43:26'),(141,1,7,'틱톡에서 유행해서 찾아옴',15,'2025-11-05 13:43:31'),(142,2,7,'Grover Washington Jr. 색소폰 미쳤다',10,'2025-11-05 13:43:31'),(143,3,7,'I see the crystal raindrops fall...',8,'2025-11-05 13:43:31'),(144,4,7,'이게 찐이지',12,'2025-11-05 13:43:31'),(145,5,7,'이런 시티팝 감성 너무 좋음',7,'2025-11-05 13:43:31'),(146,6,7,'드라이브할 때 최고',18,'2025-11-05 13:43:31'),(147,7,7,'주말 오전에 듣기 좋네요',6,'2025-11-05 13:43:31'),(148,8,7,'이 노래 모르는 사람이랑 겸상 안 함',9,'2025-11-05 13:43:31'),(149,9,7,'분위기 최고네요',5,'2025-11-05 13:43:31'),(150,10,7,'나만 알고 싶은 플리',11,'2025-11-05 13:43:31'),(151,1,8,'뉴진스 하입보이요~',35,'2025-11-05 13:43:35'),(152,2,8,'OMG 뮤비 해석 좀',20,'2025-11-05 13:43:35'),(153,3,8,'디토... 내 첫사랑 조작',28,'2025-11-05 13:43:35'),(154,4,8,'Attention은 데뷔곡 레전드',15,'2025-11-05 13:43:35'),(155,5,8,'하니 음색 미쳤음',12,'2025-11-05 13:43:35'),(156,6,8,'뉴진스의 감성은 따라갈 수가 없다',19,'2025-11-05 13:43:35'),(157,7,8,'버니즈 모여라',10,'2025-11-05 13:43:35'),(158,8,8,'ETA 신나!',8,'2025-11-05 13:43:35'),(159,9,8,'Super Shy 챌린지 춘 사람?',11,'2025-11-05 13:43:35'),(160,10,8,'민지... 갓',22,'2025-11-05 13:43:35'),(161,1,9,'잔혹한 천사의 테제... 웅장해진다',30,'2025-11-05 13:43:38'),(162,2,9,'신지... 에바에 타라',22,'2025-11-05 13:43:38'),(163,3,9,'아야나미 레이... 내 첫사랑',18,'2025-11-05 13:43:38'),(164,4,9,'OST는 진짜 goat',15,'2025-11-05 13:43:38'),(165,5,9,'에반게리온 극장판 정주행 간다',10,'2025-11-05 13:43:38'),(166,6,9,'Fly me to the moon~',25,'2025-11-05 13:43:38'),(167,7,9,'이거 듣고 뽕 차오른다',9,'2025-11-05 13:43:38'),(168,8,9,'사도... 오고 있냐?',12,'2025-11-05 13:43:38'),(169,9,9,'아스카!!!',11,'2025-11-05 13:43:38'),(170,10,9,'OST만 들어도 눈물남',17,'2025-11-05 13:43:38'),(171,1,10,'ALL CAPS WHEN YOU SPELL THE MAN NAME',40,'2025-11-05 13:43:44'),(172,2,10,'Madvillainy 앨범은 전설이다',28,'2025-11-05 13:43:44'),(173,3,10,'Villain... R.I.P',22,'2025-11-05 13:43:44'),(174,4,10,'Rap Snitch Knishes 비트  Sampling 굿',18,'2025-11-05 13:43:44'),(175,5,10,'이 마스크맨은 진짜... 천재임',15,'2025-11-05 13:43:44'),(176,6,10,'둠형 랩은 들을수록 새롭다',12,'2025-11-05 13:43:44'),(177,7,10,'라임이 예술',10,'2025-11-05 13:43:44'),(178,8,10,'진정한 언더그라운드 킹',16,'2025-11-05 13:43:44'),(179,9,10,'이런 래퍼 다신 안 나온다',20,'2025-11-05 13:43:44'),(180,10,10,'Accordion... 첫 곡부터 지림',14,'2025-11-05 13:43:44');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `emotions`
--

DROP TABLE IF EXISTS `emotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emotions` (
  `emotion_id` int NOT NULL AUTO_INCREMENT,
  `emotion_key` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`emotion_id`),
  UNIQUE KEY `emotion_key` (`emotion_key`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emotions`
--

LOCK TABLES `emotions` WRITE;
/*!40000 ALTER TABLE `emotions` DISABLE KEYS */;
INSERT INTO `emotions` VALUES (4,'Calm'),(6,'Epic'),(3,'Excited'),(1,'Happy'),(5,'Nostalgic'),(2,'Sad');
/*!40000 ALTER TABLE `emotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `friends`
--

DROP TABLE IF EXISTS `friends`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `friends` (
  `user_one_id` int NOT NULL,
  `user_two_id` int NOT NULL,
  `status` enum('PENDING','ACCEPTED','BLOCKED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `action_user_id` int NOT NULL,
  PRIMARY KEY (`user_one_id`,`user_two_id`),
  KEY `user_two_id` (`user_two_id`),
  KEY `action_user_id` (`action_user_id`),
  CONSTRAINT `friends_ibfk_1` FOREIGN KEY (`user_one_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `friends_ibfk_2` FOREIGN KEY (`user_two_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `friends_ibfk_3` FOREIGN KEY (`action_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `friends`
--

LOCK TABLES `friends` WRITE;
/*!40000 ALTER TABLE `friends` DISABLE KEYS */;
INSERT INTO `friends` VALUES (1,2,'ACCEPTED',1),(2,3,'ACCEPTED',2),(2,4,'ACCEPTED',2),(2,5,'ACCEPTED',2),(2,6,'ACCEPTED',2),(2,7,'ACCEPTED',2),(2,8,'ACCEPTED',2),(2,9,'ACCEPTED',2),(2,10,'ACCEPTED',2),(2,11,'ACCEPTED',2),(2,12,'ACCEPTED',2),(2,13,'ACCEPTED',2),(2,14,'ACCEPTED',2),(2,15,'ACCEPTED',2),(2,16,'ACCEPTED',2);
/*!40000 ALTER TABLE `friends` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `playlist_emotions`
--

DROP TABLE IF EXISTS `playlist_emotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `playlist_emotions` (
  `playlist_id` int NOT NULL,
  `emotion_id` int NOT NULL,
  PRIMARY KEY (`playlist_id`,`emotion_id`),
  KEY `emotion_id` (`emotion_id`),
  CONSTRAINT `playlist_emotions_ibfk_1` FOREIGN KEY (`playlist_id`) REFERENCES `user_playlists` (`playlist_id`) ON DELETE CASCADE,
  CONSTRAINT `playlist_emotions_ibfk_2` FOREIGN KEY (`emotion_id`) REFERENCES `emotions` (`emotion_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `playlist_emotions`
--

LOCK TABLES `playlist_emotions` WRITE;
/*!40000 ALTER TABLE `playlist_emotions` DISABLE KEYS */;
INSERT INTO `playlist_emotions` VALUES (6,1),(7,1),(8,1),(14,1),(15,1),(59,1),(62,1),(63,1),(64,1),(65,1),(76,1),(77,1),(2,2),(4,2),(9,2),(13,2),(61,2),(1,3),(6,3),(8,3),(14,3),(15,3),(59,3),(2,4),(3,4),(5,4),(7,4),(10,4),(11,4),(12,4),(13,4),(16,4),(5,5),(6,5),(7,5),(10,5),(11,5),(16,5),(1,6),(9,6),(60,6);
/*!40000 ALTER TABLE `playlist_emotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_playlists`
--

DROP TABLE IF EXISTS `user_playlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_playlists` (
  `playlist_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `youtube_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int NOT NULL,
  `status` enum('AVAILABLE','DELETED','PENDING') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AVAILABLE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`playlist_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_playlists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_playlists`
--

LOCK TABLES `user_playlists` WRITE;
/*!40000 ALTER TABLE `user_playlists` DISABLE KEYS */;
INSERT INTO `user_playlists` VALUES (1,'? KICK BACK - 체인소맨 OST 뽕맛','https://www.youtube.com/watch?v=bh0gvw5BjsU&list=OLAK5uy_lN1N0Pm0HYuyWqe6Q0gq6xJk244eqLoKs',1,'AVAILABLE','2025-11-05 13:43:06'),(2,'☔️ 비 오는 날 창밖 보면서 듣는 감성 플리','https://www.youtube.com/watch?v=u1uvv_yKhH8&list=PL5fWzZ5hMMVFnRiHyGQYyUWaOBUS9eTmr',2,'AVAILABLE','2025-11-05 13:43:06'),(3,'? 24/7 공부할 때 듣는 로파이','https://www.youtube.com/watch?v=J7oawl56piM&list=PL9ld53OlSGctvVWFmzYKbk7UnBO8pRDy6',2,'AVAILABLE','2025-11-05 13:43:06'),(4,'? 새벽 3시, 나만 알고 싶은 감성 발라드','https://www.youtube.com/watch?v=-eTaQF6GVcY&list=PL4Wt9Tdj2iBYM_2K7-SCDfmqDRzhRk0rm',3,'AVAILABLE','2025-11-05 13:43:06'),(5,'? Nujabes - 사무라이 참프루 감성','https://www.youtube.com/watch?v=-9cr2EkhP4E&list=PLUzwRBBmKGAiXhMgP8TahswgiwwGcKUz1',4,'AVAILABLE','2025-11-05 13:43:06'),(6,'? King of Pop - 마이클 잭슨 띵곡선','https://www.youtube.com/watch?v=-DlMoJ2V6uk&list=PLs0odKA07LBY5nsZ2EwA2iHzdKU6NHj0D',5,'AVAILABLE','2025-11-05 13:43:06'),(7,'? 틱톡 그 노래 - Just the Two of Us','https://www.youtube.com/watch?v=KYwA5k00p2I&list=PLhuf0WZI7cCw4jPujpIqSN88eBdGSovZS&index=1',6,'AVAILABLE','2025-11-05 13:43:06'),(8,'? Hype Boy! 뉴진스 전곡 모음','https://www.youtube.com/watch?v=-1H9bv3EG8g&list=PLiyHrD1Lz34yEHaZgEunA7OESzvxjG7NP',7,'AVAILABLE','2025-11-05 13:43:06'),(9,'? 에바에 타라... 에반게리온 OST','https://www.youtube.com/watch?v=0TbuEKUwU_U&list=PLN7YyFyRHLrxp5XwNjniS5RJ9bNOsIx0P',8,'AVAILABLE','2025-11-05 13:43:06'),(10,'? ALL CAPS - MF DOOM 믹스','https://www.youtube.com/watch?v=NcHrGCcXU74&list=PLeRL4Xd1rxH1b3Bbgq20-Jv3sT2EiAzIO&index=1',9,'AVAILABLE','2025-11-05 13:43:06'),(11,'?️ 밤의 드라이브, 도쿄 시티팝','https://www.youtube.com/watch?v=F2pQEXieIqM&list=PL_axB73onHHrbmMDsx4ow8IyscLZhtjz0&index=1&t=1s',14,'AVAILABLE','2025-11-13 10:24:36'),(12,'? 숙면을 위한 수면 유도 음악','https://www.youtube.com/watch?v=8SvEyKIPblk&list=PL2nPYlVik8ndfWohlwhxEum_5uIkoTfN5&index=1',14,'AVAILABLE','2025-11-13 10:24:36'),(13,'? 촉촉한 새벽 갬성 플리','https://www.youtube.com/watch?v=_89SAQOjCEE&list=PL2nPYlVik8nc6rrexySj99qSm0VGBxjKd&index=1',14,'AVAILABLE','2025-11-13 10:24:36'),(14,'? 2024 빌보드 인기 팝송','https://www.youtube.com/watch?v=DK_0jXPuIr0&list=PLzI4udmRp1S8Uv3LVRNpebZ5rD7C3KhXt&index=3',14,'AVAILABLE','2025-11-13 10:24:36'),(15,'? 텐션 올려! 신나는 노래','https://www.youtube.com/watch?v=8yXGI3kcLsw&list=PL2nPYlVik8ndPL9uH_KIPLHh9qXvzgcZL&index=2',14,'AVAILABLE','2025-11-13 10:24:36'),(16,'? 몽환적이고 오묘한 플리','https://www.youtube.com/watch?v=imGUlfVQWJs&list=PLlNubDzomlH1gsm26f68rCfbhlk6lTcT_&index=1',14,'AVAILABLE','2025-11-13 10:24:36'),(17,'?️ 밤의 드라이브, 도쿄 시티팝','https://www.youtube.com/watch?v=F2pQEXieIqM&list=PL_axB73onHHrbmMDsx4ow8IyscLZhtjz0&index=1&t=1s',14,'AVAILABLE','2025-11-13 10:24:37'),(18,'? 숙면을 위한 수면 유도 음악','https://www.youtube.com/watch?v=8SvEyKIPblk&list=PL2nPYlVik8ndfWohlwhxEum_5uIkoTfN5&index=1',14,'AVAILABLE','2025-11-13 10:24:37'),(19,'? 촉촉한 새벽 갬성 플리','https://www.youtube.com/watch?v=_89SAQOjCEE&list=PL2nPYlVik8nc6rrexySj99qSm0VGBxjKd&index=1',14,'AVAILABLE','2025-11-13 10:24:37'),(20,'? 2024 빌보드 인기 팝송','https://www.youtube.com/watch?v=DK_0jXPuIr0&list=PLzI4udmRp1S8Uv3LVRNpebZ5rD7C3KhXt&index=3',14,'AVAILABLE','2025-11-13 10:24:37'),(21,'? 텐션 올려! 신나는 노래','https://www.youtube.com/watch?v=8yXGI3kcLsw&list=PL2nPYlVik8ndPL9uH_KIPLHh9qXvzgcZL&index=2',14,'AVAILABLE','2025-11-13 10:24:37'),(22,'? 몽환적이고 오묘한 플리','https://www.youtube.com/watch?v=imGUlfVQWJs&list=PLlNubDzomlH1gsm26f68rCfbhlk6lTcT_&index=1',14,'AVAILABLE','2025-11-13 10:24:37'),(23,'?️ 밤의 드라이브, 도쿄 시티팝','https://www.youtube.com/watch?v=F2pQEXieIqM&list=PL_axB73onHHrbmMDsx4ow8IyscLZhtjz0&index=1&t=1s',14,'AVAILABLE','2025-11-13 10:24:38'),(24,'? 숙면을 위한 수면 유도 음악','https://www.youtube.com/watch?v=8SvEyKIPblk&list=PL2nPYlVik8ndfWohlwhxEum_5uIkoTfN5&index=1',14,'AVAILABLE','2025-11-13 10:24:38'),(25,'? 촉촉한 새벽 갬성 플리','https://www.youtube.com/watch?v=_89SAQOjCEE&list=PL2nPYlVik8nc6rrexySj99qSm0VGBxjKd&index=1',14,'AVAILABLE','2025-11-13 10:24:38'),(26,'? 2024 빌보드 인기 팝송','https://www.youtube.com/watch?v=DK_0jXPuIr0&list=PLzI4udmRp1S8Uv3LVRNpebZ5rD7C3KhXt&index=3',14,'AVAILABLE','2025-11-13 10:24:38'),(27,'? 텐션 올려! 신나는 노래','https://www.youtube.com/watch?v=8yXGI3kcLsw&list=PL2nPYlVik8ndPL9uH_KIPLHh9qXvzgcZL&index=2',14,'AVAILABLE','2025-11-13 10:24:38'),(28,'? 몽환적이고 오묘한 플리','https://www.youtube.com/watch?v=imGUlfVQWJs&list=PLlNubDzomlH1gsm26f68rCfbhlk6lTcT_&index=1',14,'AVAILABLE','2025-11-13 10:24:38'),(29,'?️ 밤의 드라이브, 도쿄 시티팝','https://www.youtube.com/watch?v=F2pQEXieIqM&list=PL_axB73onHHrbmMDsx4ow8IyscLZhtjz0&index=1&t=1s',14,'AVAILABLE','2025-11-13 10:24:38'),(30,'? 숙면을 위한 수면 유도 음악','https://www.youtube.com/watch?v=8SvEyKIPblk&list=PL2nPYlVik8ndfWohlwhxEum_5uIkoTfN5&index=1',14,'AVAILABLE','2025-11-13 10:24:38'),(31,'? 촉촉한 새벽 갬성 플리','https://www.youtube.com/watch?v=_89SAQOjCEE&list=PL2nPYlVik8nc6rrexySj99qSm0VGBxjKd&index=1',14,'AVAILABLE','2025-11-13 10:24:38'),(32,'? 2024 빌보드 인기 팝송','https://www.youtube.com/watch?v=DK_0jXPuIr0&list=PLzI4udmRp1S8Uv3LVRNpebZ5rD7C3KhXt&index=3',14,'AVAILABLE','2025-11-13 10:24:38'),(33,'? 텐션 올려! 신나는 노래','https://www.youtube.com/watch?v=8yXGI3kcLsw&list=PL2nPYlVik8ndPL9uH_KIPLHh9qXvzgcZL&index=2',14,'AVAILABLE','2025-11-13 10:24:38'),(34,'? 몽환적이고 오묘한 플리','https://www.youtube.com/watch?v=imGUlfVQWJs&list=PLlNubDzomlH1gsm26f68rCfbhlk6lTcT_&index=1',14,'AVAILABLE','2025-11-13 10:24:38'),(35,'?️ 밤의 드라이브, 도쿄 시티팝','https://www.youtube.com/watch?v=F2pQEXieIqM&list=PL_axB73onHHrbmMDsx4ow8IyscLZhtjz0&index=1&t=1s',14,'AVAILABLE','2025-11-13 10:24:38'),(36,'? 숙면을 위한 수면 유도 음악','https://www.youtube.com/watch?v=8SvEyKIPblk&list=PL2nPYlVik8ndfWohlwhxEum_5uIkoTfN5&index=1',14,'AVAILABLE','2025-11-13 10:24:38'),(37,'? 촉촉한 새벽 갬성 플리','https://www.youtube.com/watch?v=_89SAQOjCEE&list=PL2nPYlVik8nc6rrexySj99qSm0VGBxjKd&index=1',14,'AVAILABLE','2025-11-13 10:24:38'),(38,'? 2024 빌보드 인기 팝송','https://www.youtube.com/watch?v=DK_0jXPuIr0&list=PLzI4udmRp1S8Uv3LVRNpebZ5rD7C3KhXt&index=3',14,'AVAILABLE','2025-11-13 10:24:38'),(39,'? 텐션 올려! 신나는 노래','https://www.youtube.com/watch?v=8yXGI3kcLsw&list=PL2nPYlVik8ndPL9uH_KIPLHh9qXvzgcZL&index=2',14,'AVAILABLE','2025-11-13 10:24:38'),(40,'? 몽환적이고 오묘한 플리','https://www.youtube.com/watch?v=imGUlfVQWJs&list=PLlNubDzomlH1gsm26f68rCfbhlk6lTcT_&index=1',14,'AVAILABLE','2025-11-13 10:24:38'),(41,'?️ 밤의 드라이브, 도쿄 시티팝','https://www.youtube.com/watch?v=F2pQEXieIqM&list=PL_axB73onHHrbmMDsx4ow8IyscLZhtjz0&index=1&t=1s',14,'AVAILABLE','2025-11-13 10:24:39'),(42,'? 숙면을 위한 수면 유도 음악','https://www.youtube.com/watch?v=8SvEyKIPblk&list=PL2nPYlVik8ndfWohlwhxEum_5uIkoTfN5&index=1',14,'AVAILABLE','2025-11-13 10:24:39'),(43,'? 촉촉한 새벽 갬성 플리','https://www.youtube.com/watch?v=_89SAQOjCEE&list=PL2nPYlVik8nc6rrexySj99qSm0VGBxjKd&index=1',14,'AVAILABLE','2025-11-13 10:24:39'),(44,'? 2024 빌보드 인기 팝송','https://www.youtube.com/watch?v=DK_0jXPuIr0&list=PLzI4udmRp1S8Uv3LVRNpebZ5rD7C3KhXt&index=3',14,'AVAILABLE','2025-11-13 10:24:39'),(45,'? 텐션 올려! 신나는 노래','https://www.youtube.com/watch?v=8yXGI3kcLsw&list=PL2nPYlVik8ndPL9uH_KIPLHh9qXvzgcZL&index=2',14,'AVAILABLE','2025-11-13 10:24:39'),(46,'? 몽환적이고 오묘한 플리','https://www.youtube.com/watch?v=imGUlfVQWJs&list=PLlNubDzomlH1gsm26f68rCfbhlk6lTcT_&index=1',14,'AVAILABLE','2025-11-13 10:24:39'),(47,'?️ 밤의 드라이브, 도쿄 시티팝','https://www.youtube.com/watch?v=F2pQEXieIqM&list=PL_axB73onHHrbmMDsx4ow8IyscLZhtjz0&index=1&t=1s',14,'AVAILABLE','2025-11-13 10:25:34'),(48,'? 숙면을 위한 수면 유도 음악','https://www.youtube.com/watch?v=8SvEyKIPblk&list=PL2nPYlVik8ndfWohlwhxEum_5uIkoTfN5&index=1',14,'AVAILABLE','2025-11-13 10:25:34'),(49,'? 촉촉한 새벽 갬성 플리','https://www.youtube.com/watch?v=_89SAQOjCEE&list=PL2nPYlVik8nc6rrexySj99qSm0VGBxjKd&index=1',14,'AVAILABLE','2025-11-13 10:25:34'),(50,'? 2024 빌보드 인기 팝송','https://www.youtube.com/watch?v=DK_0jXPuIr0&list=PLzI4udmRp1S8Uv3LVRNpebZ5rD7C3KhXt&index=3',14,'AVAILABLE','2025-11-13 10:25:34'),(51,'? 텐션 올려! 신나는 노래','https://www.youtube.com/watch?v=8yXGI3kcLsw&list=PL2nPYlVik8ndPL9uH_KIPLHh9qXvzgcZL&index=2',14,'AVAILABLE','2025-11-13 10:25:34'),(52,'? 몽환적이고 오묘한 플리','https://www.youtube.com/watch?v=imGUlfVQWJs&list=PLlNubDzomlH1gsm26f68rCfbhlk6lTcT_&index=1',14,'AVAILABLE','2025-11-13 10:25:34'),(53,'?️ 밤의 드라이브, 도쿄 시티팝','https://www.youtube.com/watch?v=F2pQEXieIqM&list=PL_axB73onHHrbmMDsx4ow8IyscLZhtjz0&index=1&t=1s',14,'AVAILABLE','2025-11-13 10:29:10'),(54,'? 숙면을 위한 수면 유도 음악','https://www.youtube.com/watch?v=8SvEyKIPblk&list=PL2nPYlVik8ndfWohlwhxEum_5uIkoTfN5&index=1',14,'AVAILABLE','2025-11-13 10:29:10'),(55,'? 촉촉한 새벽 갬성 플리','https://www.youtube.com/watch?v=_89SAQOjCEE&list=PL2nPYlVik8nc6rrexySj99qSm0VGBxjKd&index=1',14,'AVAILABLE','2025-11-13 10:29:10'),(56,'? 2024 빌보드 인기 팝송','https://www.youtube.com/watch?v=DK_0jXPuIr0&list=PLzI4udmRp1S8Uv3LVRNpebZ5rD7C3KhXt&index=3',14,'AVAILABLE','2025-11-13 10:29:10'),(57,'? 텐션 올려! 신나는 노래','https://www.youtube.com/watch?v=8yXGI3kcLsw&list=PL2nPYlVik8ndPL9uH_KIPLHh9qXvzgcZL&index=2',14,'AVAILABLE','2025-11-13 10:29:10'),(58,'? 몽환적이고 오묘한 플리','https://www.youtube.com/watch?v=imGUlfVQWJs&list=PLlNubDzomlH1gsm26f68rCfbhlk6lTcT_&index=1',14,'AVAILABLE','2025-11-13 10:29:10'),(59,'? 청량한 J-POP 드라이브 플리','https://www.youtube.com/watch?v=894RuLFjL-4&list=PLyfuRdcqS4KrFHilaW6SSEx9SWSDzxP8b&index=1',16,'AVAILABLE','2025-11-13 11:12:02'),(60,'웅장한 뮤지컬 명곡 모음','https://www.youtube.com/watch?v=xDfjtE05KJY&list=RDxDfjtE05KJY&start_radio=1',15,'AVAILABLE','2025-11-13 11:16:09'),(61,'씬난다난다','https://www.youtube.com/watch?v=xbKma3CtBCE&list=RDxbKma3CtBCE&start_radio=1',2,'AVAILABLE','2025-11-21 06:47:44'),(62,'신나는 힙합 플리','https://www.youtube.com/watch?v=VtJ_2SbYoIM&list=RDVtJ_2SbYoIM&start_radio=1',2,'AVAILABLE','2025-11-22 06:06:09'),(63,'힙합 플리','https://www.youtube.com/watch?v=Lb6ZNJzKlOg&list=RDLb6ZNJzKlOg&start_radio=1',2,'AVAILABLE','2025-11-22 06:09:47'),(64,'힙플','https://www.youtube.com/watch?v=Lb6ZNJzKlOg&list=RDLb6ZNJzKlOg&start_radio=1',2,'AVAILABLE','2025-11-22 06:31:40'),(65,'느좋플리','https://www.youtube.com/watch?v=kYVpuwy0uGc&list=RDkYVpuwy0uGc&start_radio=1&t=6s',2,'AVAILABLE','2025-11-22 06:36:47'),(76,'크리스마스 캐롤 플리','https://www.youtube.com/watch?v=nPlNf7bJfXY',2,'AVAILABLE','2025-11-22 06:46:11'),(77,'플리','https://www.youtube.com/watch?v=PwWRQ3kjuXA&list=RDPwWRQ3kjuXA&start_radio=1',2,'AVAILABLE','2025-11-22 06:51:28');
/*!40000 ALTER TABLE `user_playlists` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('ACTIVE','DELETED','BANNED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `profile_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'chainsaw_fan','csm@test.com','$2b$10$YlkFqmSLhXRMKjsfpEw4auHQVWZKUJMhBskXo0ZbsrhpxViuf19hy','ACTIVE','2025-11-05 13:39:09',NULL),(2,'lofi_lover','lofi@test.com','$2b$10$YlkFqmSLhXRMKjsfpEw4auHQVWZKUJMhBskXo0ZbsrhpxViuf19hy','ACTIVE','2025-11-05 13:39:09',NULL),(3,'ballad_dreamer','ballad@test.com','$2b$10$YlkFqmSLhXRMKjsfpEw4auHQVWZKUJMhBskXo0ZbsrhpxViuf19hy','ACTIVE','2025-11-05 13:39:09',NULL),(4,'nujabes_soul','nujabes@test.com','$2b$10$YlkFqmSLhXRMKjsfpEw4auHQVWZKUJMhBskXo0ZbsrhpxViuf19hy','ACTIVE','2025-11-05 13:39:09',NULL),(5,'mj_fan82','mj@test.com','$2b$10$YlkFqmSLhXRMKjsfpEw4auHQVWZKUJMhBskXo0ZbsrhpxViuf19hy','ACTIVE','2025-11-05 13:39:09',NULL),(6,'just_two_of_us','grover@test.com','$2b$10$YlkFqmSLhXRMKjsfpEw4auHQVWZKUJMhBskXo0ZbsrhpxViuf19hy','ACTIVE','2025-11-05 13:39:09',NULL),(7,'newjeans_tokki','nj@test.com','$2b$10$YlkFqmSLhXRMKjsfpEw4auHQVWZKUJMhBskXo0ZbsrhpxViuf19hy','ACTIVE','2025-11-05 13:39:09',NULL),(8,'eva_pilot','eva@test.com','$2b$10$YlkFqmSLhXRMKjsfpEw4auHQVWZKUJMhBskXo0ZbsrhpxViuf19hy','ACTIVE','2025-11-05 13:39:09',NULL),(9,'mfdoom_villain','doom@test.com','$2b$10$YlkFqmSLhXRMKjsfpEw4auHQVWZKUJMhBskXo0ZbsrhpxViuf19hy','ACTIVE','2025-11-05 13:39:09',NULL),(10,'playlist_master','master@test.com','$2b$10$YlkFqmSLhXRMKjsfpEw4auHQVWZKUJMhBskXo0ZbsrhpxViuf19hy','ACTIVE','2025-11-05 13:39:09',NULL),(11,'이렐리아의 왕','irelia@test.com','$2b$10$YlkFqmSLhXRMKjsfpEw4auHQVWZKUJMhBskXo0ZbsrhpxViuf19hy','ACTIVE','2025-11-13 10:19:43',NULL),(12,'신속의 곽','kwak@test.com','$2b$10$YlkFqmSLhXRMKjsfpEw4auHQVWZKUJMhBskXo0ZbsrhpxViuf19hy','ACTIVE','2025-11-13 10:19:43',NULL),(13,'백준 화경','baekjoon@test.com','$2b$10$YlkFqmSLhXRMKjsfpEw4auHQVWZKUJMhBskXo0ZbsrhpxViuf19hy','ACTIVE','2025-11-13 10:19:43',NULL),(14,'똥깡','ddong@test.com','$2b$10$YlkFqmSLhXRMKjsfpEw4auHQVWZKUJMhBskXo0ZbsrhpxViuf19hy','ACTIVE','2025-11-13 10:20:20',NULL),(15,'xmrrl','junho@test.com','$2b$10$YlkFqmSLhXRMKjsfpEw4auHQVWZKUJMhBskXo0ZbsrhpxViuf19hy','ACTIVE','2025-11-13 10:20:20',NULL),(16,'auther','auther@test.com','$2b$10$YlkFqmSLhXRMKjsfpEw4auHQVWZKUJMhBskXo0ZbsrhpxViuf19hy','ACTIVE','2025-11-13 11:12:02',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-22 15:52:45
