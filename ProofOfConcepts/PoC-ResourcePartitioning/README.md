# PoC: Resource Partitioning & Fault Tolerance (Modulaire Monoliet)

Deze Proof of Concept (PoC) bewijst dat we binnen onze Modulaire Monoliet zware CPU-taken (zoals routeplanning) succesvol kunnen isoleren van de kritieke I/O-taken (zoals orderinvoer en tracking). Dit doen we door gebruik te maken van Docker Swarm `placement constraints`.

_Let op: Omdat de PWD-omgeving de cgroups voor hardwarematige CPU-limieten niet ondersteunt, leunt deze test puur op fysieke placement constraints (node pinning)._

## Installatie en Run-instructies (PWD Omgeving)

Deze stappen zijn geoptimaliseerd voor de testcluster op IP `204.168.179.25` met de vereiste architectuur van **3 managers en 2 workers**. Vervang `[USER]` door de actuele PWD-sessie ID.

**Stap 1: Transfer de bestanden naar de Main Manager (Node 1)**
Vanaf je lokale machine kopieer je de directory naar de eerste manager:
`scp -P 8022 -r ./ProofOfConcepts/PoC-ResourcePartitioning [USER]@204.168.179.25:~/PoC`

**Stap 2: Verbind met de cluster manager**
Log in op de main manager:
`ssh -p 8022 [USER]@204.168.179.25`

**Stap 3: Distribueer de bestanden naar de overige nodes**
Omdat de testomgeving geen externe Image Registry gebruikt, sturen we de source code handmatig over het interne netwerk naar de andere managers (node2, node3) en de workers (node4, node5):
`scp -r ~/PoC node2:~`
`scp -r ~/PoC node3:~`
`scp -r ~/PoC node4:~`
`scp -r ~/PoC node5:~`

**Stap 4: Build de images lokaal op alle 5 de nodes**
Forceer een schone build zonder cache op het hele cluster, zodat Docker overal de juiste image heeft:
`cd ~/PoC && docker build --no-cache -t ict-monolith:latest .`
`ssh node2 "cd ~/PoC && docker build --no-cache -t ict-monolith:latest ."`
`ssh node3 "cd ~/PoC && docker build --no-cache -t ict-monolith:latest ."`
`ssh node4 "cd ~/PoC && docker build --no-cache -t ict-monolith:latest ."`
`ssh node5 "cd ~/PoC && docker build --no-cache -t ict-monolith:latest ."`

**Stap 5: Deploy de architectuur**
Start de stack op vanaf de main manager:
`docker stack deploy -f poc.yaml poc`

## Het Bewijs (Testscenario)

1. Controleer de node-plaatsing om te verifiëren dat de zware calculatie uitsluitend op een worker draait (node4 of node5):
   `docker service ps resource_poc_planning-module`
2. Controleer waar de Core API draait (dit hoort op een manager node te zijn: node1, node2 of node3):
   `docker service ps resource_poc_core-module`
3. Controleer de Fault Tolerance door te verifiëren dat de Core API feilloos bereikbaar blijft, ondanks de zware CPU-belasting van de worker module:
   `curl -v http://127.0.0.1:8080`
   _(Verwacht resultaat: HTTP 200 OK met de statusmelding)_
