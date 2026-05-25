база 1 (user):
 user_id          INT AUTO_INCREMENT PRIMARY KEY,
  user_email      VARCHAR(254)   NOT NULL UNIQUE,
  user_name       VARCHAR(30)    NOT NULL,
  user_fullname   VARCHAR(30)    NOT NULL,
  user_surname    VARCHAR(30)     NULL,
  user_pass       VARCHAR(255)    NOT NULL

база 2 услуги(remont_services):
remont_service_id int, pk
remont_service_title text uniqal
remont_service_pricePerSqm int
remont_service_description text, not null
remont_service_description text, not null
remont_service_durationDays int, not null
remont_service_path_media varchar(30), 
remont_service_included_works text

база 3 созданные заявки(orders):
order_id primary key, int
orderd_square int, not null
order_description text, 
order_date date not null



