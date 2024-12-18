-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Vært: mysql
-- Genereringstid: 17. 12 2024 kl. 09:06:00
-- Serverversion: 8.4.2
-- PHP-version: 8.2.23

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `Dashboard`
--

-- --------------------------------------------------------

--
-- Struktur-dump for tabellen `Group`
--

CREATE TABLE `Group` (
  `group_name` varchar(255) DEFAULT NULL,
  `group_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Data dump for tabellen `Group`
--

INSERT INTO `Group` (`group_name`, `group_id`) VALUES
('WUOE24', 1),
('WUOE23', 2);

-- --------------------------------------------------------

--
-- Struktur-dump for tabellen `Project`
--

CREATE TABLE `Project` (
  `project_id` int NOT NULL,
  `project_name` varchar(255) DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `template_id` int DEFAULT NULL,
  `create_date` timestamp NULL DEFAULT NULL,
  `portainer_id` int DEFAULT NULL,
  `group_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Data dump for tabellen `Project`
--

INSERT INTO `Project` (`project_id`, `project_name`, `url`, `user_id`, `template_id`, `create_date`, `portainer_id`, `group_id`) VALUES
(15, 'Eksmaens projekt', 'www.eksamen.dk', 4, 1, '2024-12-17 09:29:50', 660, 1),
(16, 'projekt', 'projekt', 4, 1, '2024-12-17 09:42:06', 661, 1),
(17, 'projekt navn', 'projektnavn', 4, 2, '2024-12-17 09:52:24', 662, 1);

-- --------------------------------------------------------

--
-- Struktur-dump for tabellen `Template`
--

CREATE TABLE `Template` (
  `template_id` int NOT NULL,
  `template` varchar(255) DEFAULT NULL,
  `content` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Data dump for tabellen `Template`
--

INSERT INTO `Template` (`template_id`, `template`, `content`) VALUES
(1, 'Wordpress', 'version: \'3.7\'\nnetworks:\n  traefik-proxy:\n    external: true\n  wp-network:\n    driver: overlay\n\nservices:\n  wordpress:\n    image: wordpress:latest\n    environment:\n      WORDPRESS_DB_HOST: db\n      WORDPRESS_DB_USER: wpuser\n      WORDPRESS_DB_PASSWORD: wppassword\n      WORDPRESS_DB_NAME: wpdatabase\n    networks:\n      - traefik-proxy\n      - wp-network\n    deploy:\n      labels:\n        - \"traefik.enable=true\"\n        - \"traefik.http.routers.CHANGEME01.rule=Host(`SUBDOMAIN01.kubelab.dk`)\"\n        - \"traefik.http.routers.CHANGEME01.entrypoints=web,websecure\"\n        - \"traefik.http.routers.CHANGEME01.tls.certresolver=letsencrypt\"\n        - \"traefik.http.services.CHANGEME01.loadbalancer.server.port=80\"\n  db:\n    image: mariadb:latest\n    environment:\n      MYSQL_ROOT_PASSWORD: rootpassword\n      MYSQL_DATABASE: wpdatabase\n      MYSQL_USER: wpuser\n      MYSQL_PASSWORD: wppassword\n    networks:\n      - wp-network\n  phpmyadmin:\n    image: phpmyadmin:latest\n    environment:\n      PMA_HOST: db\n      PMA_USER: wpuser\n      PMA_PASSWORD: wppassword\n    networks:\n      - traefik-proxy\n      - wp-network\n    deploy:\n      labels:\n        - \"traefik.enable=true\"\n        - \"traefik.http.routers.CHANGEME02.rule=Host(`SUBDOMAIN02.kubelab.dk`)\"\n        - \"traefik.http.routers.CHANGEME02.entrypoints=web,websecure\"\n        - \"traefik.http.routers.CHANGEME02.tls.certresolver=letsencrypt\"\n        - \"traefik.http.services.CHANGEME02.loadbalancer.server.port=80\"'),
(2, 'Nginx', '{\"networks\":{\"traefik-proxy\":{\"external\":true}},\"services\":{\"test\":{\"image\":\"nginx:latest\",\"networks\":[\"traefik-proxy\"],\"deploy\":{\"labels\":[\"traefik.enable=true\",\"traefik.http.routers.CHANGEME.rule=Host(`SUBDOMAIN.kubelab.dk`)\",\"traefik.http.routers.CHANGEME.entrypoints=web,websecure\",\"traefik.http.routers.CHANGEME.tls.certresolver=letsencrypt\",\"traefik.http.services.CHANGEME.loadbalancer.server.port=80\"]}}}}');

-- --------------------------------------------------------

--
-- Struktur-dump for tabellen `Users`
--

CREATE TABLE `Users` (
  `user_id` int NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `admin` tinyint(1) DEFAULT NULL,
  `group_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Data dump for tabellen `Users`
--

INSERT INTO `Users` (`user_id`, `first_name`, `last_name`, `email`, `password`, `admin`, `group_id`) VALUES
(4, 'Kenneth', 'Hr', 'kenneth@ucl.dk', '123', 1, 1),
(6, 'Kristoffer', 'Madsen', 'kristoffer@ucl.dk', '123', NULL, 1);

--
-- Begrænsninger for dumpede tabeller
--

--
-- Indeks for tabel `Group`
--
ALTER TABLE `Group`
  ADD PRIMARY KEY (`group_id`);

--
-- Indeks for tabel `Project`
--
ALTER TABLE `Project`
  ADD PRIMARY KEY (`project_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `template_id` (`template_id`),
  ADD KEY `fk_group` (`group_id`);

--
-- Indeks for tabel `Template`
--
ALTER TABLE `Template`
  ADD PRIMARY KEY (`template_id`);

--
-- Indeks for tabel `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`user_id`),
  ADD KEY `FK_Group_id` (`group_id`);

--
-- Brug ikke AUTO_INCREMENT for slettede tabeller
--

--
-- Tilføj AUTO_INCREMENT i tabel `Group`
--
ALTER TABLE `Group`
  MODIFY `group_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Tilføj AUTO_INCREMENT i tabel `Project`
--
ALTER TABLE `Project`
  MODIFY `project_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- Tilføj AUTO_INCREMENT i tabel `Template`
--
ALTER TABLE `Template`
  MODIFY `template_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Tilføj AUTO_INCREMENT i tabel `Users`
--
ALTER TABLE `Users`
  MODIFY `user_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Begrænsninger for dumpede tabeller
--

--
-- Begrænsninger for tabel `Project`
--
ALTER TABLE `Project`
  ADD CONSTRAINT `fk_group` FOREIGN KEY (`group_id`) REFERENCES `Group` (`group_id`),
  ADD CONSTRAINT `Project_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`),
  ADD CONSTRAINT `Project_ibfk_2` FOREIGN KEY (`template_id`) REFERENCES `Template` (`template_id`);

--
-- Begrænsninger for tabel `Users`
--
ALTER TABLE `Users`
  ADD CONSTRAINT `fk_fremmednogle` FOREIGN KEY (`group_id`) REFERENCES `Group` (`group_id`),
  ADD CONSTRAINT `FK_Group_id` FOREIGN KEY (`group_id`) REFERENCES `Group` (`group_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
