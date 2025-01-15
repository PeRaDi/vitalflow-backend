--
-- PostgreSQL database dump
--

-- Dumped from database version 15.10 (Homebrew)
-- Dumped by pg_dump version 15.10 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: vitalflow-dev; Type: DATABASE; Schema: -; Owner: peradi
--

CREATE DATABASE "vitalflow-dev" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'C';


ALTER DATABASE "vitalflow-dev" OWNER TO peradi;

\connect -reuse-previous=on "dbname='vitalflow-dev'"

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alert_types; Type: TABLE; Schema: public; Owner: peradi
--

CREATE TABLE public.alert_types (
    id integer NOT NULL,
    label text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.alert_types OWNER TO peradi;

--
-- Name: alert_types_id_seq; Type: SEQUENCE; Schema: public; Owner: peradi
--

CREATE SEQUENCE public.alert_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.alert_types_id_seq OWNER TO peradi;

--
-- Name: alert_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peradi
--

ALTER SEQUENCE public.alert_types_id_seq OWNED BY public.alert_types.id;


--
-- Name: alerts; Type: TABLE; Schema: public; Owner: peradi
--

CREATE TABLE public.alerts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    message text NOT NULL,
    alert_type_id integer NOT NULL,
    meta text DEFAULT '{}'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    dismissed boolean DEFAULT false NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.alerts OWNER TO peradi;

--
-- Name: alerts_alert_type_id_seq; Type: SEQUENCE; Schema: public; Owner: peradi
--

CREATE SEQUENCE public.alerts_alert_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.alerts_alert_type_id_seq OWNER TO peradi;

--
-- Name: alerts_alert_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peradi
--

ALTER SEQUENCE public.alerts_alert_type_id_seq OWNED BY public.alerts.alert_type_id;


--
-- Name: alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: peradi
--

CREATE SEQUENCE public.alerts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.alerts_id_seq OWNER TO peradi;

--
-- Name: alerts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peradi
--

ALTER SEQUENCE public.alerts_id_seq OWNED BY public.alerts.id;


--
-- Name: alerts_user_id_seq; Type: SEQUENCE; Schema: public; Owner: peradi
--

CREATE SEQUENCE public.alerts_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.alerts_user_id_seq OWNER TO peradi;

--
-- Name: alerts_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peradi
--

ALTER SEQUENCE public.alerts_user_id_seq OWNED BY public.alerts.user_id;


--
-- Name: auth_tokens_blacklist; Type: TABLE; Schema: public; Owner: peradi
--

CREATE TABLE public.auth_tokens_blacklist (
    id integer NOT NULL,
    token text NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.auth_tokens_blacklist OWNER TO peradi;

--
-- Name: auth_tokens_blacklist_id_seq; Type: SEQUENCE; Schema: public; Owner: peradi
--

CREATE SEQUENCE public.auth_tokens_blacklist_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.auth_tokens_blacklist_id_seq OWNER TO peradi;

--
-- Name: auth_tokens_blacklist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peradi
--

ALTER SEQUENCE public.auth_tokens_blacklist_id_seq OWNED BY public.auth_tokens_blacklist.id;


--
-- Name: item_measure_units; Type: TABLE; Schema: public; Owner: peradi
--

CREATE TABLE public.item_measure_units (
    id integer NOT NULL,
    name text NOT NULL,
    abbreviation text NOT NULL,
    conversion_factor numeric,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    is_length boolean DEFAULT false NOT NULL,
    is_mass boolean DEFAULT false NOT NULL,
    is_volume boolean DEFAULT false NOT NULL,
    is_units boolean DEFAULT false NOT NULL
);


ALTER TABLE public.item_measure_units OWNER TO peradi;

--
-- Name: item_measure_units_id_seq; Type: SEQUENCE; Schema: public; Owner: peradi
--

CREATE SEQUENCE public.item_measure_units_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.item_measure_units_id_seq OWNER TO peradi;

--
-- Name: item_measure_units_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peradi
--

ALTER SEQUENCE public.item_measure_units_id_seq OWNED BY public.item_measure_units.id;


--
-- Name: item_stock; Type: TABLE; Schema: public; Owner: peradi
--

CREATE TABLE public.item_stock (
    id integer NOT NULL,
    item_id integer NOT NULL,
    quantity numeric NOT NULL,
    item_measure_unit_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.item_stock OWNER TO peradi;

--
-- Name: item_stock_id_seq; Type: SEQUENCE; Schema: public; Owner: peradi
--

CREATE SEQUENCE public.item_stock_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.item_stock_id_seq OWNER TO peradi;

--
-- Name: item_stock_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peradi
--

ALTER SEQUENCE public.item_stock_id_seq OWNED BY public.item_stock.id;


--
-- Name: item_stock_item_id_seq; Type: SEQUENCE; Schema: public; Owner: peradi
--

CREATE SEQUENCE public.item_stock_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.item_stock_item_id_seq OWNER TO peradi;

--
-- Name: item_stock_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peradi
--

ALTER SEQUENCE public.item_stock_item_id_seq OWNED BY public.item_stock.item_id;


--
-- Name: item_stock_item_measure_unit_id_seq; Type: SEQUENCE; Schema: public; Owner: peradi
--

CREATE SEQUENCE public.item_stock_item_measure_unit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.item_stock_item_measure_unit_id_seq OWNER TO peradi;

--
-- Name: item_stock_item_measure_unit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peradi
--

ALTER SEQUENCE public.item_stock_item_measure_unit_id_seq OWNED BY public.item_stock.item_measure_unit_id;


--
-- Name: items; Type: TABLE; Schema: public; Owner: peradi
--

CREATE TABLE public.items (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    tenant_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.items OWNER TO peradi;

--
-- Name: items_id_seq; Type: SEQUENCE; Schema: public; Owner: peradi
--

CREATE SEQUENCE public.items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.items_id_seq OWNER TO peradi;

--
-- Name: items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peradi
--

ALTER SEQUENCE public.items_id_seq OWNED BY public.items.id;


--
-- Name: items_tenant_id_seq; Type: SEQUENCE; Schema: public; Owner: peradi
--

CREATE SEQUENCE public.items_tenant_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.items_tenant_id_seq OWNER TO peradi;

--
-- Name: items_tenant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peradi
--

ALTER SEQUENCE public.items_tenant_id_seq OWNED BY public.items.tenant_id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: peradi
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    label text NOT NULL,
    description text,
    default_level smallint NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.permissions OWNER TO peradi;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: peradi
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.permissions_id_seq OWNER TO peradi;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peradi
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: peradi
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    display_name text NOT NULL,
    level smallint NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    label text NOT NULL
);


ALTER TABLE public.roles OWNER TO peradi;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: peradi
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_id_seq OWNER TO peradi;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peradi
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: signup_tokens; Type: TABLE; Schema: public; Owner: peradi
--

CREATE TABLE public.signup_tokens (
    id integer NOT NULL,
    token integer NOT NULL,
    admin_id integer NOT NULL,
    tenant_id integer NOT NULL,
    role_id integer NOT NULL,
    user_email text NOT NULL
);


ALTER TABLE public.signup_tokens OWNER TO peradi;

--
-- Name: signup_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: peradi
--

CREATE SEQUENCE public.signup_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.signup_tokens_id_seq OWNER TO peradi;

--
-- Name: signup_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peradi
--

ALTER SEQUENCE public.signup_tokens_id_seq OWNED BY public.signup_tokens.id;


--
-- Name: stock_transactions; Type: TABLE; Schema: public; Owner: peradi
--

CREATE TABLE public.stock_transactions (
    id integer NOT NULL,
    item_stock_id integer NOT NULL,
    user_id integer NOT NULL,
    transaction_type_id integer NOT NULL,
    quantity numeric NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.stock_transactions OWNER TO peradi;

--
-- Name: stock_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: peradi
--

CREATE SEQUENCE public.stock_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.stock_transactions_id_seq OWNER TO peradi;

--
-- Name: stock_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peradi
--

ALTER SEQUENCE public.stock_transactions_id_seq OWNED BY public.stock_transactions.id;


--
-- Name: stock_transactions_item_stock_id_seq; Type: SEQUENCE; Schema: public; Owner: peradi
--

CREATE SEQUENCE public.stock_transactions_item_stock_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.stock_transactions_item_stock_id_seq OWNER TO peradi;

--
-- Name: stock_transactions_item_stock_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peradi
--

ALTER SEQUENCE public.stock_transactions_item_stock_id_seq OWNED BY public.stock_transactions.item_stock_id;


--
-- Name: stock_transactions_transaction_type_id_seq; Type: SEQUENCE; Schema: public; Owner: peradi
--

CREATE SEQUENCE public.stock_transactions_transaction_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.stock_transactions_transaction_type_id_seq OWNER TO peradi;

--
-- Name: stock_transactions_transaction_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peradi
--

ALTER SEQUENCE public.stock_transactions_transaction_type_id_seq OWNED BY public.stock_transactions.transaction_type_id;


--
-- Name: stock_transactions_user_id_seq; Type: SEQUENCE; Schema: public; Owner: peradi
--

CREATE SEQUENCE public.stock_transactions_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.stock_transactions_user_id_seq OWNER TO peradi;

--
-- Name: stock_transactions_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peradi
--

ALTER SEQUENCE public.stock_transactions_user_id_seq OWNED BY public.stock_transactions.user_id;


--
-- Name: tenant_contacts; Type: TABLE; Schema: public; Owner: peradi
--

CREATE TABLE public.tenant_contacts (
    id integer NOT NULL,
    contact integer NOT NULL,
    tenant_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tenant_contacts OWNER TO peradi;

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: peradi
--

CREATE TABLE public.tenants (
    id integer NOT NULL,
    name text NOT NULL,
    address text NOT NULL,
    email text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.tenants OWNER TO peradi;

--
-- Name: tenants_id_seq; Type: SEQUENCE; Schema: public; Owner: peradi
--

CREATE SEQUENCE public.tenants_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tenants_id_seq OWNER TO peradi;

--
-- Name: tenants_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peradi
--

ALTER SEQUENCE public.tenants_id_seq OWNED BY public.tenants.id;


--
-- Name: transaction_types; Type: TABLE; Schema: public; Owner: peradi
--

CREATE TABLE public.transaction_types (
    id smallint NOT NULL,
    label text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.transaction_types OWNER TO peradi;

--
-- Name: transaction_types_id_seq; Type: SEQUENCE; Schema: public; Owner: peradi
--

CREATE SEQUENCE public.transaction_types_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.transaction_types_id_seq OWNER TO peradi;

--
-- Name: transaction_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peradi
--

ALTER SEQUENCE public.transaction_types_id_seq OWNED BY public.transaction_types.id;


--
-- Name: user_permissions; Type: TABLE; Schema: public; Owner: peradi
--

CREATE TABLE public.user_permissions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    permission_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_permissions OWNER TO peradi;

--
-- Name: user_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: peradi
--

CREATE SEQUENCE public.user_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_permissions_id_seq OWNER TO peradi;

--
-- Name: user_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peradi
--

ALTER SEQUENCE public.user_permissions_id_seq OWNED BY public.user_permissions.id;


--
-- Name: user_permissions_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: peradi
--

CREATE SEQUENCE public.user_permissions_permission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_permissions_permission_id_seq OWNER TO peradi;

--
-- Name: user_permissions_permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peradi
--

ALTER SEQUENCE public.user_permissions_permission_id_seq OWNED BY public.user_permissions.permission_id;


--
-- Name: user_permissions_user_id_seq; Type: SEQUENCE; Schema: public; Owner: peradi
--

CREATE SEQUENCE public.user_permissions_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_permissions_user_id_seq OWNER TO peradi;

--
-- Name: user_permissions_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peradi
--

ALTER SEQUENCE public.user_permissions_user_id_seq OWNED BY public.user_permissions.user_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: peradi
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email text NOT NULL,
    username text NOT NULL,
    name text NOT NULL,
    password text NOT NULL,
    change_password_token integer,
    change_password_token_expiry timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    active boolean DEFAULT true NOT NULL,
    role_id integer NOT NULL,
    tenant_id integer
);


ALTER TABLE public.users OWNER TO peradi;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: peradi
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO peradi;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peradi
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: users_role_id_seq; Type: SEQUENCE; Schema: public; Owner: peradi
--

CREATE SEQUENCE public.users_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_role_id_seq OWNER TO peradi;

--
-- Name: users_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peradi
--

ALTER SEQUENCE public.users_role_id_seq OWNED BY public.users.role_id;


--
-- Name: users_tenant_id_seq; Type: SEQUENCE; Schema: public; Owner: peradi
--

CREATE SEQUENCE public.users_tenant_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_tenant_id_seq OWNER TO peradi;

--
-- Name: users_tenant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: peradi
--

ALTER SEQUENCE public.users_tenant_id_seq OWNED BY public.users.tenant_id;


--
-- Name: alert_types id; Type: DEFAULT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.alert_types ALTER COLUMN id SET DEFAULT nextval('public.alert_types_id_seq'::regclass);


--
-- Name: alerts id; Type: DEFAULT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.alerts ALTER COLUMN id SET DEFAULT nextval('public.alerts_id_seq'::regclass);


--
-- Name: alerts user_id; Type: DEFAULT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.alerts ALTER COLUMN user_id SET DEFAULT nextval('public.alerts_user_id_seq'::regclass);


--
-- Name: alerts alert_type_id; Type: DEFAULT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.alerts ALTER COLUMN alert_type_id SET DEFAULT nextval('public.alerts_alert_type_id_seq'::regclass);


--
-- Name: auth_tokens_blacklist id; Type: DEFAULT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.auth_tokens_blacklist ALTER COLUMN id SET DEFAULT nextval('public.auth_tokens_blacklist_id_seq'::regclass);


--
-- Name: item_measure_units id; Type: DEFAULT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.item_measure_units ALTER COLUMN id SET DEFAULT nextval('public.item_measure_units_id_seq'::regclass);


--
-- Name: item_stock id; Type: DEFAULT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.item_stock ALTER COLUMN id SET DEFAULT nextval('public.item_stock_id_seq'::regclass);


--
-- Name: item_stock item_id; Type: DEFAULT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.item_stock ALTER COLUMN item_id SET DEFAULT nextval('public.item_stock_item_id_seq'::regclass);


--
-- Name: item_stock item_measure_unit_id; Type: DEFAULT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.item_stock ALTER COLUMN item_measure_unit_id SET DEFAULT nextval('public.item_stock_item_measure_unit_id_seq'::regclass);


--
-- Name: items id; Type: DEFAULT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.items ALTER COLUMN id SET DEFAULT nextval('public.items_id_seq'::regclass);


--
-- Name: items tenant_id; Type: DEFAULT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.items ALTER COLUMN tenant_id SET DEFAULT nextval('public.items_tenant_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: signup_tokens id; Type: DEFAULT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.signup_tokens ALTER COLUMN id SET DEFAULT nextval('public.signup_tokens_id_seq'::regclass);


--
-- Name: stock_transactions id; Type: DEFAULT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.stock_transactions ALTER COLUMN id SET DEFAULT nextval('public.stock_transactions_id_seq'::regclass);


--
-- Name: stock_transactions item_stock_id; Type: DEFAULT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.stock_transactions ALTER COLUMN item_stock_id SET DEFAULT nextval('public.stock_transactions_item_stock_id_seq'::regclass);


--
-- Name: stock_transactions user_id; Type: DEFAULT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.stock_transactions ALTER COLUMN user_id SET DEFAULT nextval('public.stock_transactions_user_id_seq'::regclass);


--
-- Name: stock_transactions transaction_type_id; Type: DEFAULT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.stock_transactions ALTER COLUMN transaction_type_id SET DEFAULT nextval('public.stock_transactions_transaction_type_id_seq'::regclass);


--
-- Name: tenants id; Type: DEFAULT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.tenants ALTER COLUMN id SET DEFAULT nextval('public.tenants_id_seq'::regclass);


--
-- Name: transaction_types id; Type: DEFAULT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.transaction_types ALTER COLUMN id SET DEFAULT nextval('public.transaction_types_id_seq'::regclass);


--
-- Name: user_permissions id; Type: DEFAULT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.user_permissions ALTER COLUMN id SET DEFAULT nextval('public.user_permissions_id_seq'::regclass);


--
-- Name: user_permissions user_id; Type: DEFAULT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.user_permissions ALTER COLUMN user_id SET DEFAULT nextval('public.user_permissions_user_id_seq'::regclass);


--
-- Name: user_permissions permission_id; Type: DEFAULT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.user_permissions ALTER COLUMN permission_id SET DEFAULT nextval('public.user_permissions_permission_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: users role_id; Type: DEFAULT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.users ALTER COLUMN role_id SET DEFAULT nextval('public.users_role_id_seq'::regclass);


--
-- Name: users tenant_id; Type: DEFAULT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.users ALTER COLUMN tenant_id SET DEFAULT nextval('public.users_tenant_id_seq'::regclass);


--
-- Data for Name: alert_types; Type: TABLE DATA; Schema: public; Owner: peradi
--

COPY public.alert_types (id, label, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: alerts; Type: TABLE DATA; Schema: public; Owner: peradi
--

COPY public.alerts (id, user_id, message, alert_type_id, meta, created_at, dismissed, updated_at) FROM stdin;
\.


--
-- Data for Name: auth_tokens_blacklist; Type: TABLE DATA; Schema: public; Owner: peradi
--

COPY public.auth_tokens_blacklist (id, token, user_id) FROM stdin;
\.


--
-- Data for Name: item_measure_units; Type: TABLE DATA; Schema: public; Owner: peradi
--

COPY public.item_measure_units (id, name, abbreviation, conversion_factor, created_at, updated_at, is_length, is_mass, is_volume, is_units) FROM stdin;
\.


--
-- Data for Name: item_stock; Type: TABLE DATA; Schema: public; Owner: peradi
--

COPY public.item_stock (id, item_id, quantity, item_measure_unit_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: peradi
--

COPY public.items (id, name, description, tenant_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: peradi
--

COPY public.permissions (id, label, description, default_level, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: peradi
--

COPY public.roles (id, display_name, level, created_at, updated_at, label) FROM stdin;
\.


--
-- Data for Name: signup_tokens; Type: TABLE DATA; Schema: public; Owner: peradi
--

COPY public.signup_tokens (id, token, admin_id, tenant_id, role_id, user_email) FROM stdin;
\.


--
-- Data for Name: stock_transactions; Type: TABLE DATA; Schema: public; Owner: peradi
--

COPY public.stock_transactions (id, item_stock_id, user_id, transaction_type_id, quantity, created_at) FROM stdin;
\.


--
-- Data for Name: tenant_contacts; Type: TABLE DATA; Schema: public; Owner: peradi
--

COPY public.tenant_contacts (id, contact, tenant_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: public; Owner: peradi
--

COPY public.tenants (id, name, address, email, created_at, updated_at, active) FROM stdin;
\.


--
-- Data for Name: transaction_types; Type: TABLE DATA; Schema: public; Owner: peradi
--

COPY public.transaction_types (id, label, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_permissions; Type: TABLE DATA; Schema: public; Owner: peradi
--

COPY public.user_permissions (id, user_id, permission_id, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: peradi
--

COPY public.users (id, email, username, name, password, change_password_token, change_password_token_expiry, created_at, updated_at, active, role_id, tenant_id) FROM stdin;
\.


--
-- Name: alert_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peradi
--

SELECT pg_catalog.setval('public.alert_types_id_seq', 1, false);


--
-- Name: alerts_alert_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peradi
--

SELECT pg_catalog.setval('public.alerts_alert_type_id_seq', 1, false);


--
-- Name: alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peradi
--

SELECT pg_catalog.setval('public.alerts_id_seq', 1, false);


--
-- Name: alerts_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peradi
--

SELECT pg_catalog.setval('public.alerts_user_id_seq', 1, false);


--
-- Name: auth_tokens_blacklist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peradi
--

SELECT pg_catalog.setval('public.auth_tokens_blacklist_id_seq', 1, false);


--
-- Name: item_measure_units_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peradi
--

SELECT pg_catalog.setval('public.item_measure_units_id_seq', 1, false);


--
-- Name: item_stock_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peradi
--

SELECT pg_catalog.setval('public.item_stock_id_seq', 1, false);


--
-- Name: item_stock_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peradi
--

SELECT pg_catalog.setval('public.item_stock_item_id_seq', 1, false);


--
-- Name: item_stock_item_measure_unit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peradi
--

SELECT pg_catalog.setval('public.item_stock_item_measure_unit_id_seq', 1, false);


--
-- Name: items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peradi
--

SELECT pg_catalog.setval('public.items_id_seq', 1, false);


--
-- Name: items_tenant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peradi
--

SELECT pg_catalog.setval('public.items_tenant_id_seq', 1, false);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peradi
--

SELECT pg_catalog.setval('public.permissions_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peradi
--

SELECT pg_catalog.setval('public.roles_id_seq', 1, false);


--
-- Name: signup_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peradi
--

SELECT pg_catalog.setval('public.signup_tokens_id_seq', 1, false);


--
-- Name: stock_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peradi
--

SELECT pg_catalog.setval('public.stock_transactions_id_seq', 1, false);


--
-- Name: stock_transactions_item_stock_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peradi
--

SELECT pg_catalog.setval('public.stock_transactions_item_stock_id_seq', 1, false);


--
-- Name: stock_transactions_transaction_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peradi
--

SELECT pg_catalog.setval('public.stock_transactions_transaction_type_id_seq', 1, false);


--
-- Name: stock_transactions_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peradi
--

SELECT pg_catalog.setval('public.stock_transactions_user_id_seq', 1, false);


--
-- Name: tenants_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peradi
--

SELECT pg_catalog.setval('public.tenants_id_seq', 1, false);


--
-- Name: transaction_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peradi
--

SELECT pg_catalog.setval('public.transaction_types_id_seq', 1, false);


--
-- Name: user_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peradi
--

SELECT pg_catalog.setval('public.user_permissions_id_seq', 1, false);


--
-- Name: user_permissions_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peradi
--

SELECT pg_catalog.setval('public.user_permissions_permission_id_seq', 1, false);


--
-- Name: user_permissions_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peradi
--

SELECT pg_catalog.setval('public.user_permissions_user_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peradi
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: users_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peradi
--

SELECT pg_catalog.setval('public.users_role_id_seq', 1, false);


--
-- Name: users_tenant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: peradi
--

SELECT pg_catalog.setval('public.users_tenant_id_seq', 1, false);


--
-- Name: alert_types alert_types_id_pk; Type: CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.alert_types
    ADD CONSTRAINT alert_types_id_pk PRIMARY KEY (id);


--
-- Name: alerts alerts_id_pk; Type: CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_id_pk PRIMARY KEY (id);


--
-- Name: auth_tokens_blacklist auth_tokens_blacklist_id_pk; Type: CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.auth_tokens_blacklist
    ADD CONSTRAINT auth_tokens_blacklist_id_pk PRIMARY KEY (id);


--
-- Name: item_stock inventory_item_stock_id_pk; Type: CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.item_stock
    ADD CONSTRAINT inventory_item_stock_id_pk PRIMARY KEY (id);


--
-- Name: items inventory_items_id_pk; Type: CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT inventory_items_id_pk PRIMARY KEY (id);


--
-- Name: item_measure_units item_units_id_pk; Type: CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.item_measure_units
    ADD CONSTRAINT item_units_id_pk PRIMARY KEY (id);


--
-- Name: permissions permission_id_pk; Type: CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permission_id_pk PRIMARY KEY (id);


--
-- Name: roles role_id_pk; Type: CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT role_id_pk PRIMARY KEY (id);


--
-- Name: roles roles_pk; Type: CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pk UNIQUE (label);


--
-- Name: signup_tokens signup_tokens_id_pk; Type: CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.signup_tokens
    ADD CONSTRAINT signup_tokens_id_pk PRIMARY KEY (id);


--
-- Name: signup_tokens signup_tokens_pk; Type: CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.signup_tokens
    ADD CONSTRAINT signup_tokens_pk UNIQUE (token);


--
-- Name: stock_transactions stock_transactions_id_pk; Type: CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.stock_transactions
    ADD CONSTRAINT stock_transactions_id_pk PRIMARY KEY (id);


--
-- Name: tenant_contacts tenant_contacts_id_pk; Type: CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.tenant_contacts
    ADD CONSTRAINT tenant_contacts_id_pk PRIMARY KEY (id);


--
-- Name: tenants tenants_id_pk; Type: CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_id_pk PRIMARY KEY (id);


--
-- Name: transaction_types transaction_types_pk; Type: CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.transaction_types
    ADD CONSTRAINT transaction_types_pk PRIMARY KEY (id);


--
-- Name: users user_email; Type: CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT user_email UNIQUE (email);


--
-- Name: users user_id_pk; Type: CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT user_id_pk PRIMARY KEY (id);


--
-- Name: user_permissions user_permissions_id_pk; Type: CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_id_pk PRIMARY KEY (id);


--
-- Name: users user_username; Type: CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT user_username UNIQUE (username);


--
-- Name: alerts alerts_alert_types_fk; Type: FK CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_alert_types_fk FOREIGN KEY (alert_type_id) REFERENCES public.alert_types(id) ON DELETE CASCADE;


--
-- Name: alerts alerts_users_fk; Type: FK CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_users_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: auth_tokens_blacklist auth_tokens_blacklist_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.auth_tokens_blacklist
    ADD CONSTRAINT auth_tokens_blacklist_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: items inventory_items_tenants_fk; Type: FK CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT inventory_items_tenants_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE RESTRICT;


--
-- Name: item_stock item_stock_item_measure_units_fk; Type: FK CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.item_stock
    ADD CONSTRAINT item_stock_item_measure_units_fk FOREIGN KEY (item_measure_unit_id) REFERENCES public.item_measure_units(id) ON DELETE RESTRICT;


--
-- Name: item_stock item_stock_items_fk; Type: FK CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.item_stock
    ADD CONSTRAINT item_stock_items_fk FOREIGN KEY (item_id) REFERENCES public.items(id) ON DELETE RESTRICT;


--
-- Name: signup_tokens signup_tokens_roles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.signup_tokens
    ADD CONSTRAINT signup_tokens_roles_id_fk FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- Name: signup_tokens signup_tokens_tenants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.signup_tokens
    ADD CONSTRAINT signup_tokens_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: signup_tokens signup_tokens_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.signup_tokens
    ADD CONSTRAINT signup_tokens_users_id_fk FOREIGN KEY (admin_id) REFERENCES public.users(id);


--
-- Name: stock_transactions stock_transactions_item_stock_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.stock_transactions
    ADD CONSTRAINT stock_transactions_item_stock_id_fk FOREIGN KEY (item_stock_id) REFERENCES public.item_stock(id);


--
-- Name: stock_transactions stock_transactions_transaction_types_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.stock_transactions
    ADD CONSTRAINT stock_transactions_transaction_types_id_fk FOREIGN KEY (transaction_type_id) REFERENCES public.transaction_types(id);


--
-- Name: stock_transactions stock_transactions_users_fk; Type: FK CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.stock_transactions
    ADD CONSTRAINT stock_transactions_users_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: tenant_contacts tenant_contacts_tenants_fk; Type: FK CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.tenant_contacts
    ADD CONSTRAINT tenant_contacts_tenants_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: user_permissions user_permissions_permissions_fk; Type: FK CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_permissions_fk FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: user_permissions user_permissions_users_fk; Type: FK CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT user_permissions_users_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_roles_fk; Type: FK CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_roles_fk FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE RESTRICT;


--
-- Name: users users_tenants_fk; Type: FK CONSTRAINT; Schema: public; Owner: peradi
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_tenants_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

