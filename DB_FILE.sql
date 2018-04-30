create table OA00_CONTADOR
(
	ID int not null
		primary key,
	NOME_CONTADOR varchar(100) null,
	QTDE int null
)
;

create table OA01_ORACAO
(
	ID_ORACAO int auto_increment
		primary key,
	NOME varchar(255) null,
	EMAIL varchar(100) null,
	ORACAO varchar(4000) null,
	HASHTAG varchar(255) null,
	QTDE int default '0' null,
	APROVADA varchar(1) null,
	DT_ORACAO timestamp default CURRENT_TIMESTAMP not null
)
;

create index IDX_QTDE
	on OA01_ORACAO (QTDE)
;
