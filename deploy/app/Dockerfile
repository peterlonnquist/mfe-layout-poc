# Generisk image för alla appar. Varje app är en egen container och deployas för sig.
# Kör `nx build <app>` först, sedan t.ex.:
#   docker build -f deploy/app/Dockerfile --build-arg APP=arenden --build-arg BAS=/arenden/ -t mfe-layout-poc/arenden .
FROM nginx:1.27-alpine
ARG APP
ARG BAS=/
ENV APP_BAS=${BAS}
COPY deploy/app/default.conf.template /etc/nginx/templates/default.conf.template
# Filerna läggs under appens bas-sökväg, så /arenden/main.js finns på /arenden/main.js i containern.
COPY dist/apps/${APP}/browser /usr/share/nginx/html${BAS}
