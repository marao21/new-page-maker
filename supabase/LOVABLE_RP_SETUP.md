# Lovable RP Web — configuração do Supabase

O painel web usa Supabase Auth e as tabelas `lovable_rp_*` para perfis, projetos, comandos, conexões e histórico.

## 1. Ativar o projeto

O projeto atualmente vinculado (`viqaxygjnawsdjdmchet`) está inativo. A tentativa de restauração retornou o limite de projetos gratuitos ativos da organização. Não pause nem exclua outro projeto sem decidir qual pode ser afetado.

## 2. Aplicar a migração

Com o projeto ativo, abra o SQL Editor do Supabase e execute o conteúdo de:

`supabase/migrations/20261018180000_lovable_rp_web.sql`

A migração cria as tabelas, índices, triggers e políticas RLS. Não execute isso em um banco de outro produto sem confirmar que é o banco pretendido.

## 3. Configurar as variáveis de ambiente do site

Defina no ambiente de deploy (Vercel/Lovable) as variáveis públicas do projeto correto:

- `VITE_SUPABASE_URL` — URL do projeto Supabase.
- `VITE_SUPABASE_PUBLISHABLE_KEY` — chave publishable/anon do mesmo projeto.

Não use `service_role` nem uma chave secreta no navegador.

## 4. Criar o primeiro administrador

1. Cadastre a conta do administrador pela tela de acesso do Lovable RP Web.
2. Confirme o e-mail, caso a autenticação exija confirmação.
3. No SQL Editor, confira o perfil criado usando o e-mail que você acabou de cadastrar:

```sql
select id, email, role, access_status
from public.lovable_rp_profiles
where lower(email) = lower('SUBSTITUA_PELO_SEU_EMAIL');
```

4. Confirme que o resultado é exatamente a conta que deve administrar o sistema. Copie o `id` retornado e execute a atualização abaixo, substituindo o UUID:

```sql
update public.lovable_rp_profiles
set role = 'admin', access_status = 'approved'
where id = 'SUBSTITUA_PELO_UUID_CONFIRMADO';
```

Não remova o filtro por `id` nem rode a atualização sem conferir a conta. Depois, saia e entre novamente no painel.

## 5. Validar

- Cadastro cria perfil com acesso pendente.
- Usuário pendente não acessa projetos, comandos ou histórico.
- Administrador consegue aprovar, bloquear e reativar usuários.
- Comandos bem-sucedidos e falhas ficam registrados no histórico quando o Supabase está disponível.
- Os resultados de execução mostram o commit real do GitHub; não são gerados registros de sucesso fictícios.

## Limitações atuais

- O painel usa GitHub para commits e Gemini API para gerar as alterações. Ele não reutiliza automaticamente a sessão do site ChatGPT nem chama o modelo interno do ChatGPT.
- O Supabase não foi reativado nem teve a migração aplicada, porque a restauração foi bloqueada pelo limite de projetos gratuitos ativos. A aplicação precisa ser validada novamente após a ativação e configuração das variáveis.
