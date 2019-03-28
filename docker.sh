docker build -t kryops/vlight . \
  && docker run --privileged -p 8000:8000 -it --init kryops/vlight
